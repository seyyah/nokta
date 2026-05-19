import axios from "axios";
import { ENV, getMissingEnvMessage, hasGroqApiKey } from "../config/env";
import { buildGroqMessages } from "../utils/promptBuilder";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const askGroq = async ({ messages, temperature = 0.7, maxTokens = 700 }) => {
  if (!hasGroqApiKey()) {
    throw new Error(getMissingEnvMessage());
  }

  const payload = {
    model: ENV.GROQ_MODEL,
    messages: buildGroqMessages(messages),
    temperature,
    max_tokens: maxTokens,
    top_p: 1,
    stream: false
  };

  try {
    const response = await groqClient.post("/chat/completions", payload, {
      headers: {
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`
      }
    });

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq API boş cevap döndürdü.");
    }

    return String(content).trim();
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;

    if (status === 401) {
      throw new Error("Groq API anahtarı geçersiz. .env dosyasındaki API key değerini kontrol et.");
    }

    if (status === 429) {
      throw new Error("Groq API rate limit verdi. Biraz bekleyip tekrar dene.");
    }

    if (status >= 500) {
      throw new Error("Groq sunucusunda geçici bir sorun var. Biraz sonra tekrar dene.");
    }

    throw new Error(apiMessage || "Groq API isteği başarısız oldu.");
  }
};

export const testGroqConnection = async () => {
  const reply = await askGroq({
    messages: [
      {
        role: "user",
        content: "Sadece 'Nokta hazır.' yaz."
      }
    ],
    temperature: 0.2,
    maxTokens: 50
  });

  return reply;
};

export const getGroqEndpointInfo = () => {
  return {
    endpoint: GROQ_CHAT_COMPLETIONS_URL,
    model: ENV.GROQ_MODEL,
    hasApiKey: hasGroqApiKey()
  };
};