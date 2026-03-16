import types

from modal_app import main as backend


class DummyDict(dict):
    """In-memory stand-in for Modal Dict with .get/.__setitem__."""

    def get(self, key, default=None):
        return super().get(key, default)


def test_run_section_pipeline_happy_path(monkeypatch):
    section_id = "parent-1:section:0"
    text = "This is a short test section."
    voice_id = "lucy"

    store = DummyDict()
    store[section_id] = {
        "id": section_id,
        "kind": "section",
        "parent_id": "parent-1",
        "index": 0,
        "text": text,
        "voice_id": voice_id,
        "state": "queued",
        "progress": 0,
        "error": None,
        "mp3": None,
    }

    fake_updates = [
        {"progress": 50, "chunk": 1, "total": 2},
        {"progress": 100, "chunk": 2, "total": 2, "mp3": b"fake-mp3"},
    ]

    # Patch backend globals to avoid Modal/Chatterbox
    monkeypatch.setattr(backend, "job_store", store)
    monkeypatch.setattr(backend, "_resolve_voice_path", lambda v: "/tmp/voice.wav")
    # Fake TTS object with .generate_and_stitch_with_progress.remote_gen(...)
    fake_method = types.SimpleNamespace(
        remote_gen=lambda chunks, voice_path: list(fake_updates)
    )
    monkeypatch.setattr(
        backend,
        "ChatterboxTTS",
        lambda: types.SimpleNamespace(
            generate_and_stitch_with_progress=fake_method,
        ),
    )
    # completed_jobs bookkeeping is used but not critical for state
    monkeypatch.setattr(
        backend,
        "completed_jobs",
        {"_completed": []},
    )

    # run_section_pipeline is a Modal function; invoke via .local for tests
    backend.run_section_pipeline.local(section_id)

    job = store[section_id]
    assert job["state"] == "complete"
    assert job["progress"] == 100
    assert job["mp3"] == b"fake-mp3"


