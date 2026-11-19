#!/usr/bin/env bash
# One-time setup per fresh machine/session (~2-4 min). Safe to re-run.
set -e; cd "$(dirname "$0")/.."
[ -d node_modules/three ] || npm install --no-audit --no-fund
python3 -c "import kokoro_onnx, faster_whisper, soundfile, scipy, PIL" 2>/dev/null || pip install --break-system-packages -q kokoro-onnx faster-whisper soundfile scipy pillow
# Chatterbox (channel voice). CPU torch first so pip does not pull the huge GPU build.
python3 -c "import torch" 2>/dev/null || pip install --break-system-packages -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
python3 -c "import chatterbox" 2>/dev/null || { pip install --break-system-packages -q --no-deps chatterbox-tts==0.1.7 && pip install --break-system-packages -q librosa==0.11.0 s3tokenizer transformers==5.2.0 diffusers==0.29.0 resemble-perth conformer==0.3.2 safetensors==0.5.3 pykakasi==2.3.0 pyloudnorm omegaconf; }
mkdir -p tools/models
[ -f tools/models/kokoro.onnx ] || curl -sSLf -o tools/models/kokoro.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f tools/models/voices.bin ] || curl -sSLf -o tools/models/voices.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg missing"
echo "setup ok"
