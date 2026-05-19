const getEnvValue = (key, fallback = "") => {
  const value = process.env[key];

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
};

export const ENV = {
  GROQ_API_KEY: getEnvValue("EXPO_PUBLIC_GROQ_API_KEY"),
  GROQ_MODEL: getEnvValue("EXPO_PUBLIC_GROQ_MODEL", "llama-3.3-70b-versatile"),
  APP_NAME: getEnvValue("EXPO_PUBLIC_APP_NAME", "Nokta AI Assistant")
};

export const hasGroqApiKey = () => {
  return Boolean(ENV.GROQ_API_KEY && ENV.GROQ_API_KEY !== "BURAYA_GROQ_API_KEY_GELECEK");
};

export const getMissingEnvMessage = () => {
  if (!hasGroqApiKey()) {
    return "Groq API anahtarı bulunamadı. Lütfen .env dosyasındaki EXPO_PUBLIC_GROQ_API_KEY değerini kontrol et.";
  }

  return "";
};