// Central configuration — API keys come from .env via EXPO_PUBLIC_ prefix
export const CONFIG = {
    AI_PROVIDER: process.env.EXPO_PUBLIC_AI_PROVIDER || 'gemini',
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
    GEMINI_MODEL: 'gemini-2.0-flash',
    OPENAI_BASE_URL: 'https://api.openai.com/v1',
    OPENAI_MODEL: 'gpt-4o-mini',
    GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
    GROQ_MODEL: 'llama-3.3-70b-versatile',
    APP_NAME: 'Spec Architect',
    MAX_QUESTIONS: 5,
};

export default CONFIG;
