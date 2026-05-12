const express = require('express');
const { StreamClient } = require('@stream-io/node-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- KRİTİK BİLGİLER ---
const apiKey = "jw5pnauppcd7";
const apiSecret = "mex6bza8dp3cvg7zjv9bbdsr66rfk7zjtbxuz4c5gae9tskkpv4k899qzhzxj8rr";

// Sunucu tarafı istemcisi
const serverClient = new StreamClient(apiKey, apiSecret);

app.get('/token', (req, res) => {
  // App.js'den gelen ID'yi alıyoruz, gelmezse senin okul numaranı varsayılan yapıyoruz
  const user_id = req.query.user_id || '231118017';
  
  try {
    // Token üretirken sadece user_id stringini veriyoruz
    // Stream tokenı burada doğru payload ile oluşturuluyor.
    const token = serverClient.createToken(user_id);
    
    console.log(`-----------------------------------------`);
    console.log(`✅ Token Üretildi: ${user_id}`);
    console.log(`🎫 Token: ${token.substring(0, 20)}...`);
    console.log(`-----------------------------------------`);
    
    res.json({ token });
  } catch (error) {
    console.error("❌ Token Üretme Hatası:", error);
    res.status(500).json({ error: 'Token üretilemedi' });
  }
});

const PORT = 8080;
// 0.0.0.0 sayesinde telefonun 192.168.1.101 üzerinden ulaşabilecek
app.listen(PORT, '0.0.0.0', () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 TOKEN SERVER ÇALIŞIYOR`);
  console.log(`🌍 Endpoint: http://192.168.1.101:${PORT}/token`);
  console.log(`🎯 Hedef ID: 231118017`);
  console.log(`-----------------------------------------`);
});