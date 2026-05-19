import axios from "axios";
import { ENV, getMissingEnvMessage, hasGroqApiKey } from "../config/env";

const GROQ_AUDIO_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

const getAudioFileName = (uri) => {
  const cleanUri = String(uri || "");
  const lastPart = cleanUri.split("/").pop();

  if (lastPart && lastPart.includes(".")) {
    return lastPart;
  }

  return "nokta-voice.m4a";
};

const getAudioMimeType = (uri) => {
  const cleanUri = String(uri || "").toLowerCase();

  if (cleanUri.endsWith(".wav")) {
    return "audio/wav";
  }

  if (cleanUri.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (cleanUri.endsWith(".caf")) {
    return "audio/x-caf";
  }

  if (cleanUri.endsWith(".3gp")) {
    return "audio/3gpp";
  }

  return "audio/mp4";
};

export const transcribeAudioWithGroq = async (audioUri) => {
  const cleanUri = String(audioUri || "").trim();

  if (!cleanUri) {
    throw new Error("Ses kaydı bulunamadı.");
  }

  if (!hasGroqApiKey()) {
    throw new Error(getMissingEnvMessage());
  }

  const formData = new FormData();

  formData.append("file", {
    uri: cleanUri,
    name: getAudioFileName(cleanUri),
    type: getAudioMimeType(cleanUri)
  });

  formData.append("model", "whisper-large-v3-turbo");
  formData.append("language", "tr");
  formData.append("response_format", "json");
  formData.append("temperature", "0");

  try {
    const response = await axios.post(GROQ_AUDIO_TRANSCRIPTION_URL, formData, {
      timeout: 45000,
      headers: {
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
        Accept: "application/json"
      }
    });

    const text = response?.data?.text;

    if (!text) {
      throw new Error("Ses metne çevrilemedi. Daha net ve kısa konuşarak tekrar dene.");
    }

    return String(text).trim();
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;

    if (status === 401) {
      throw new Error("Groq API anahtarı geçersiz. .env dosyasındaki API key değerini kontrol et.");
    }

    if (status === 413) {
      throw new Error("Ses kaydı çok büyük. Daha kısa konuşup tekrar dene.");
    }

    if (status === 429) {
      throw new Error("Groq ses tanıma rate limit verdi. Biraz bekleyip tekrar dene.");
    }

    throw new Error(apiMessage || "Ses metne çevrilirken hata oluştu.");
  }
};