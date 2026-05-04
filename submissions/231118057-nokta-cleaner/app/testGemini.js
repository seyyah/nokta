const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  require('dotenv').config();
  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("hello");
    console.log(res.response.text());
  } catch(e) {
    console.error("1.5-flash Error:", e.message);
  }
}
run();
