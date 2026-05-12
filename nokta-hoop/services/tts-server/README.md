# Nokta Hoop TTS Server

Local text-to-speech service for Mascot responses. It supports Chatterbox
Multilingual and Piper. The mobile app does not talk to this service directly.
The token server proxies requests so the app can keep using the same public
token-server URL.

## Setup

```powershell
cd services\tts-server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python src\main.py
```

Use Chatterbox for a heavier multilingual model with optional voice cloning:

```env
TTS_PROVIDER=chatterbox
```

Use Piper for a much lighter local Turkish voice:

```env
TTS_PROVIDER=piper
```

The first synthesis downloads and loads the selected model. Chatterbox is much
heavier and GPU is strongly recommended. Piper is smaller and is better for
fast local demos.

Optional voice cloning:

```env
CHATTERBOX_AUDIO_PROMPT_PATH=D:\path\to\voice.wav
```

Use a clean short voice sample in the same language as the requested speech.
