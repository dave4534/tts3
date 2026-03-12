"""
TTS Web App — Modal backend.

FastAPI API (via @modal.asgi_app) + Chatterbox GPU workers.
Serves file parsing, chunking, TTS generation, and audio stitching.
"""

import modal

app = modal.App("tts-web-app")

# TODO: Add image with ffmpeg, pydub, PyMuPDF, Chatterbox
# TODO: Add FastAPI app via @modal.asgi_app()
# TODO: Add GPU functions for TTS generation + stitching
