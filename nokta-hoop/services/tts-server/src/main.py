from __future__ import annotations

import hashlib
import os
import shutil
import urllib.request
import wave
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


class TtsRequest(BaseModel):
    text: str = Field(min_length=1)
    language_id: str | None = None
    audio_prompt_path: str | None = None


app = FastAPI(title="Nokta Hoop TTS Server")

SERVICE_DIR = Path(__file__).resolve().parents[1]


def load_service_env() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return

    load_dotenv(SERVICE_DIR / ".env")


load_service_env()


def resolve_service_path(value: str) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = SERVICE_DIR / path
    return path.resolve()


def parse_bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def parse_optional_int_env(name: str) -> int | None:
    value = os.getenv(name, "").strip()
    if not value:
        return None
    return int(value)


def parse_optional_float_env(name: str) -> float | None:
    value = os.getenv(name, "").strip()
    if not value:
        return None
    return float(value)


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8790"))
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "chatterbox").strip().lower()
DEVICE = os.getenv("CHATTERBOX_DEVICE", "auto")
DEFAULT_LANGUAGE_ID = os.getenv("CHATTERBOX_LANGUAGE_ID", "tr")
DEFAULT_AUDIO_PROMPT_PATH = os.getenv("CHATTERBOX_AUDIO_PROMPT_PATH", "").strip()
MAX_TEXT_LENGTH = int(os.getenv("TTS_MAX_TEXT_LENGTH", "1000"))
CACHE_DIR = resolve_service_path(
    os.getenv("TTS_CACHE_DIR", str(SERVICE_DIR / "cache")),
)

PIPER_PROVIDER = "piper"
CHATTERBOX_PROVIDER = "chatterbox-multilingual"
PIPER_MODEL_URL = os.getenv(
    "PIPER_MODEL_URL",
    "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/tr/tr_TR/fettah/medium/tr_TR-fettah-medium.onnx",
).strip()
PIPER_CONFIG_URL = os.getenv(
    "PIPER_CONFIG_URL",
    "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/tr/tr_TR/fettah/medium/tr_TR-fettah-medium.onnx.json",
).strip()
MODELS_DIR = resolve_service_path(os.getenv("TTS_MODEL_DIR", "models"))
PIPER_MODEL_PATH = resolve_service_path(
    os.getenv("PIPER_MODEL_PATH", str(MODELS_DIR / "tr_TR-fettah-medium.onnx")),
)
PIPER_CONFIG_PATH = resolve_service_path(
    os.getenv(
        "PIPER_CONFIG_PATH",
        str(MODELS_DIR / "tr_TR-fettah-medium.onnx.json"),
    ),
)
PIPER_USE_CUDA = parse_bool_env("PIPER_USE_CUDA", False)
PIPER_SPEAKER_ID = parse_optional_int_env("PIPER_SPEAKER_ID")
PIPER_LENGTH_SCALE = parse_optional_float_env("PIPER_LENGTH_SCALE")
PIPER_NOISE_SCALE = parse_optional_float_env("PIPER_NOISE_SCALE")
PIPER_NOISE_W_SCALE = parse_optional_float_env("PIPER_NOISE_W_SCALE")
PIPER_VOLUME = float(os.getenv("PIPER_VOLUME", "1.0"))

_model: Any | None = None
_piper_voice: Any | None = None
_model_lock = Lock()
_piper_voice_lock = Lock()
_generation_lock = Lock()


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "nokta-hoop-tts-server",
        "provider": get_provider(),
        "languageId": DEFAULT_LANGUAGE_ID,
    }


@app.post("/tts")
def create_tts_audio(request: TtsRequest) -> dict[str, str]:
    text = request.text.strip()
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Text is too long. Max length is {MAX_TEXT_LENGTH}.",
        )

    language_id = (request.language_id or DEFAULT_LANGUAGE_ID).strip() or "tr"
    provider = get_provider()

    if provider == PIPER_PROVIDER:
        return create_piper_tts_audio(text, language_id)

    if provider != CHATTERBOX_PROVIDER:
        raise HTTPException(
            status_code=500,
            detail=f"Unsupported TTS_PROVIDER: {TTS_PROVIDER}",
        )

    return create_chatterbox_tts_audio(request, text, language_id)


def create_chatterbox_tts_audio(
    request: TtsRequest,
    text: str,
    language_id: str,
) -> dict[str, str]:
    audio_prompt_path = get_audio_prompt_path(request.audio_prompt_path)
    cache_key = build_cache_key(
        CHATTERBOX_PROVIDER,
        text,
        language_id,
        audio_prompt_path or "default-voice",
    )
    filename = f"{cache_key}.wav"
    output_path = CACHE_DIR / filename

    if not output_path.exists():
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        model = get_model()
        kwargs: dict[str, str] = {"language_id": language_id}
        if audio_prompt_path:
            kwargs["audio_prompt_path"] = audio_prompt_path

        with _generation_lock:
            wav = model.generate(text, **kwargs)
        samples = to_mono_float32(wav)
        sf.write(output_path, samples, model.sr)

    return {
        "audioPath": f"/audio/{filename}",
        "filename": filename,
        "languageId": language_id,
        "provider": CHATTERBOX_PROVIDER,
    }


def create_piper_tts_audio(text: str, language_id: str) -> dict[str, str]:
    cache_key = build_cache_key(
        PIPER_PROVIDER,
        text,
        language_id,
        get_piper_voice_key(),
    )
    filename = f"{cache_key}.wav"
    output_path = CACHE_DIR / filename

    if not output_path.exists():
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        voice = get_piper_voice()
        syn_config = get_piper_synthesis_config()

        with _generation_lock:
            with wave.open(str(output_path), "wb") as wav_file:
                voice.synthesize_wav(text, wav_file, syn_config=syn_config)

    return {
        "audioPath": f"/audio/{filename}",
        "filename": filename,
        "languageId": language_id,
        "provider": PIPER_PROVIDER,
    }


@app.get("/audio/{filename}")
def get_audio(filename: str) -> FileResponse:
    if not is_safe_audio_filename(filename):
        raise HTTPException(status_code=400, detail="Invalid audio filename.")

    audio_path = CACHE_DIR / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename=filename,
        headers={"Cache-Control": "public, max-age=86400"},
    )


def get_model() -> Any:
    global _model
    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model

        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS

        device = DEVICE
        if device == "auto":
            device = "cuda" if torch.cuda.is_available() else "cpu"

        _model = ChatterboxMultilingualTTS.from_pretrained(device=device)
        return _model


def get_piper_voice() -> Any:
    global _piper_voice
    if _piper_voice is not None:
        return _piper_voice

    with _piper_voice_lock:
        if _piper_voice is not None:
            return _piper_voice

        from piper import PiperVoice

        ensure_piper_model_files()
        _piper_voice = PiperVoice.load(
            PIPER_MODEL_PATH,
            config_path=PIPER_CONFIG_PATH,
            use_cuda=PIPER_USE_CUDA,
        )
        return _piper_voice


def ensure_piper_model_files() -> None:
    if not PIPER_MODEL_PATH.exists():
        download_file(PIPER_MODEL_URL, PIPER_MODEL_PATH)

    if not PIPER_CONFIG_PATH.exists():
        download_file(PIPER_CONFIG_URL, PIPER_CONFIG_PATH)


def download_file(url: str, output_path: Path) -> None:
    if not url:
        raise HTTPException(
            status_code=500,
            detail=f"Missing download URL for {output_path.name}.",
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_name(f"{output_path.name}.tmp")
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "nokta-hoop-tts-server"},
    )

    try:
        with urllib.request.urlopen(request) as response:
            with temp_path.open("wb") as output_file:
                shutil.copyfileobj(response, output_file)
        temp_path.replace(output_path)
    except Exception as err:
        temp_path.unlink(missing_ok=True)
        message = err.reason if hasattr(err, "reason") else str(err)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download Piper model asset: {message}",
        ) from err


def get_piper_synthesis_config() -> Any:
    from piper import SynthesisConfig

    return SynthesisConfig(
        speaker_id=PIPER_SPEAKER_ID,
        length_scale=PIPER_LENGTH_SCALE,
        noise_scale=PIPER_NOISE_SCALE,
        noise_w_scale=PIPER_NOISE_W_SCALE,
        volume=PIPER_VOLUME,
    )


def get_audio_prompt_path(value: str | None) -> str | None:
    raw_value = (value or DEFAULT_AUDIO_PROMPT_PATH).strip()
    if not raw_value:
        return None

    prompt_path = Path(raw_value).expanduser().resolve()
    if not prompt_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Audio prompt file does not exist: {prompt_path}",
        )

    return str(prompt_path)


def build_cache_key(
    provider: str,
    text: str,
    language_id: str,
    voice_key: str,
) -> str:
    payload = "\n".join(
        [
            provider,
            language_id,
            voice_key,
            text,
        ],
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:32]


def get_provider() -> str:
    if TTS_PROVIDER in {"chatterbox", CHATTERBOX_PROVIDER}:
        return CHATTERBOX_PROVIDER
    if TTS_PROVIDER == PIPER_PROVIDER:
        return PIPER_PROVIDER
    return TTS_PROVIDER


def get_piper_voice_key() -> str:
    return "|".join(
        [
            PIPER_MODEL_PATH.name,
            str(PIPER_SPEAKER_ID),
            str(PIPER_LENGTH_SCALE),
            str(PIPER_NOISE_SCALE),
            str(PIPER_NOISE_W_SCALE),
            str(PIPER_VOLUME),
        ],
    )


def to_mono_float32(wav: Any) -> np.ndarray:
    if hasattr(wav, "detach"):
        wav = wav.detach().cpu().numpy()

    samples = np.asarray(wav, dtype=np.float32).squeeze()
    if samples.ndim == 0:
        samples = np.asarray([float(samples)], dtype=np.float32)
    if samples.ndim > 1:
        samples = samples.reshape(-1)

    return np.clip(samples, -1.0, 1.0)


def is_safe_audio_filename(filename: str) -> bool:
    return (
        filename.endswith(".wav")
        and len(filename) == 36
        and all(char in "0123456789abcdef.wav" for char in filename)
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT)
