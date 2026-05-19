const API_KEY = 'AIzaSyCqjeXtMTBJro_S8ebWnBBHmu2O8e0WWF8';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

async function test() {
  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Merhaba, sen kimsin?' }] }]
      })
    });
    const data = await response.json();
    console.log('AI Response:', data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
