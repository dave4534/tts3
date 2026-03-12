"""
TTS Web App — Modal backend.

FastAPI API (via @modal.asgi_app) + Chatterbox GPU workers.
Serves file parsing, chunking, TTS generation, and audio stitching.
"""

import io
from pathlib import Path

import modal

# Image: Chatterbox TTS + voice prompts
# Download sample voices at build time (Lucy.wav) for testing until /voices has real clips
CHATTERBOX_VOICES_URL = "https://modal-cdn.com/blog/audio/chatterbox-tts-voices.zip"
VOICES_DIR = "/voices"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("wget", "unzip", "ffmpeg")
    .run_commands(
        f"mkdir -p {VOICES_DIR} && "
        f"wget -q {CHATTERBOX_VOICES_URL} -O /tmp/voices.zip && "
        f"unzip -q -o /tmp/voices.zip -d {VOICES_DIR} && "
        f"rm /tmp/voices.zip"
    )
    .uv_pip_install(
        "chatterbox-tts==0.1.6",
        "peft==0.18.0",
        "pydub",
        "torch",
        "torchaudio",
    )
)

app = modal.App("tts-web-app", image=image)

with image.imports():
    from pydub import AudioSegment  # noqa: E402
    import torchaudio  # noqa: E402


@app.cls(
    gpu="a10g",
    image=image,
    secrets=[modal.Secret.from_name("hf-token")],
)
class ChatterboxTTS:
    """GPU-backed TTS: generates audio from text + voice reference clip."""

    @modal.enter()
    def load_model(self) -> None:
        from chatterbox.tts_turbo import ChatterboxTurboTTS

        self.model = ChatterboxTurboTTS.from_pretrained(device="cuda")

    @modal.method()
    def generate(
        self,
        text: str,
        voice_path: str,
    ) -> bytes:
        """
        Generate audio from a text chunk and voice reference clip.

        Args:
            text: Input text (up to ~300 chars per chunk).
            voice_path: Path to 6-10 second WAV reference clip.

        Returns:
            WAV audio as bytes.
        """
        wav = self.model.generate(
            text,
            audio_prompt_path=voice_path,
        )
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav, self.model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()

    @modal.method()
    def generate_batch(
        self,
        chunks: list[str],
        voice_path: str,
    ) -> list[bytes]:
        """
        Generate audio for multiple chunks in parallel; returns segments in input order.

        Args:
            chunks: List of text chunks (each up to ~300 chars).
            voice_path: Path to 6-10 second WAV reference clip.

        Returns:
            List of WAV audio bytes, one per chunk, in the same order as chunks.
        """
        if not chunks:
            return []
        inputs = [(chunk, voice_path) for chunk in chunks]
        return list(self.generate.starmap(inputs, order_outputs=True))

    @modal.method()
    def stitch(self, wav_segments: list[bytes]) -> bytes:
        """
        Concatenate WAV segments into a single MP3.

        Args:
            wav_segments: List of WAV audio bytes in order.

        Returns:
            Single MP3 as bytes.
        """
        if not wav_segments:
            return b""
        combined = AudioSegment.empty()
        for wav_bytes in wav_segments:
            segment = AudioSegment.from_wav(io.BytesIO(wav_bytes))
            combined += segment
        buffer = io.BytesIO()
        combined.export(buffer, format="mp3")
        buffer.seek(0)
        return buffer.read()

    @modal.method()
    def generate_and_stitch(
        self,
        chunks: list[str],
        voice_path: str,
    ) -> bytes:
        """
        Generate TTS for chunks in parallel, then stitch into a single MP3.

        Args:
            chunks: List of text chunks (each up to ~300 chars).
            voice_path: Path to 6-10 second WAV reference clip.

        Returns:
            Single MP3 as bytes.
        """
        segments = self.generate_batch.local(chunks, voice_path)
        return self.stitch.local(segments)


# Default voice path inside the container (zip extracts to /voices/chatterbox-tts-voices/prompts/)
DEFAULT_VOICE_PATH = f"{VOICES_DIR}/chatterbox-tts-voices/prompts/Lucy.wav"


@app.local_entrypoint()
def test(
    prompt: str = "Hello from the TTS web app. Chatterbox is running on Modal.",
    output_path: str = "/tmp/tts-output.wav",
) -> None:
    """Test single-chunk generation (task 1.2)."""
    tts = ChatterboxTTS()
    print(f"Generating with voice: {DEFAULT_VOICE_PATH}")
    audio_bytes = tts.generate.remote(prompt, DEFAULT_VOICE_PATH)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_bytes(audio_bytes)
    print(f"Saved to {output_path}")


@app.local_entrypoint()
def test_batch(
    output_dir: str = "/tmp/tts-batch",
) -> None:
    """Test parallel batch generation (task 1.3)."""
    chunks = [
        "First chunk: Hello from the TTS web app.",
        "Second chunk: Chatterbox is running on Modal.",
        "Third chunk: Batch processing in parallel.",
    ]
    tts = ChatterboxTTS()
    print(f"Generating {len(chunks)} chunks in parallel with voice: {DEFAULT_VOICE_PATH}")
    segments = tts.generate_batch.remote(chunks, DEFAULT_VOICE_PATH)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, audio_bytes in enumerate(segments):
        path = out_dir / f"chunk_{i:03d}.wav"
        path.write_bytes(audio_bytes)
        print(f"Saved {path.name} ({len(audio_bytes)} bytes)")
    print(f"Done. Output in {output_dir}")


@app.local_entrypoint()
def test_pipeline(
    output_path: str = "/tmp/tts-output.mp3",
) -> None:
    """Test full pipeline: batch TTS + stitch (task 1.4)."""
    chunks = [
        "First chunk: Hello from the TTS web app.",
        "Second chunk: Chatterbox is running on Modal.",
        "Third chunk: Batch processing and stitching into one MP3.",
    ]
    tts = ChatterboxTTS()
    print(f"Generating {len(chunks)} chunks and stitching to MP3...")
    mp3_bytes = tts.generate_and_stitch.remote(chunks, DEFAULT_VOICE_PATH)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_bytes(mp3_bytes)
    print(f"Saved to {output_path} ({len(mp3_bytes)} bytes)")
