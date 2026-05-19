const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

// DİKKAT: Buraya kendi Gemini API Key'inizi girin.
const GEMINI_API_KEY = "AIzaSyDWlUSOGaQJE6rmn5gb2MX3Weg4T-qg_3k";

app.post('/repair', async (req, res) => {
    try {
        const { markdown } = req.body;
        if (!markdown) return res.status(400).json({ error: 'Markdown bulunamadı.' });

        console.log('🤖 Otonom Onarım İsteği Geldi! Raporu okuyorum...');

        // Markdown içinden Ekran adını bulalım (Örn: ## Ekran: JournalScreen)
        const screenMatches = [...markdown.matchAll(/## Ekran:\s*(\w+)/g)];
        if (!screenMatches || screenMatches.length === 0) {
            console.log('❌ Ekran adı bulunamadı.');
            return res.status(400).json({ error: 'Ekran adı markdown içinde bulunamadı.' });
        }
        
        let screenName = null;
        for (const match of screenMatches) {
            if (match[1] !== 'Unknown') {
                screenName = match[1].trim();
                break;
            }
        }

        if (!screenName) {
            console.log('❌ Geçerli bir ekran adı bulunamadı (Tümü Unknown). Lütfen yeni bir hata raporu çekin.');
            return res.status(400).json({ error: 'Geçerli bir ekran adı bulunamadı.' });
        }

        if (!screenName.endsWith('Screen')) screenName += 'Screen';
        
        const filePath = path.join(__dirname, 'src', 'screens', `${screenName}.tsx`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Dosya bulunamadı: ${filePath}`);
            return res.status(404).json({ error: 'İlgili ekran dosyası bulunamadı.' });
        }

        const currentCode = fs.readFileSync(filePath, 'utf-8');
        console.log(`✅ ${screenName}.tsx dosyası bulundu. Gemini'a gönderiliyor...`);

        // Gemini Prompt Hazırlığı
        const prompt = `
Aşağıda React Native projemin bir ekranına ait kaynak kod ve kullanıcının bildirdiği bir hata raporu (Markdown formatında) var.
Senin görevin otonom bir AI kodlama ajanı olarak bu hatayı çözmek.

Hata Raporu:
${markdown}

Mevcut Kaynak Kod (${screenName}.tsx):
\`\`\`tsx
${currentCode}
\`\`\`

Lütfen hatayı gideren GÜNCELLENMİŞ TAM KODU yaz. 
SADECE kodu ver, markdown backtick (\`\`\`) İÇİNDE OLMASIN, hiçbir açıklama yazma. Çünkü çıktını doğrudan dosyaya yazacağım.
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: "Sen otonom bir düzeltme ajanısın. Sadece saf kod çıktısı verirsin." }]},
                generationConfig: { temperature: 0.1 }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('Gemini Hatası:', data.error.message);
            return res.status(500).json({ error: 'Yapay zeka servisi hata döndürdü.' });
        }

        let newCode = data.candidates[0].content.parts[0].text;
        
        // Temizleme (Eğer LLM inatla markdown formatında döndürdüyse)
        if (newCode.startsWith('```tsx')) newCode = newCode.replace(/^```tsx\n/, '');
        if (newCode.startsWith('```javascript')) newCode = newCode.replace(/^```javascript\n/, '');
        if (newCode.startsWith('```')) newCode = newCode.replace(/^```\n/, '');
        if (newCode.endsWith('```\n')) newCode = newCode.replace(/```\n$/, '');
        if (newCode.endsWith('```')) newCode = newCode.replace(/```$/, '');

        // Dosyanın Üzerine Yaz (Fast Refresh tetiklenecek)
        fs.writeFileSync(filePath, newCode, 'utf-8');
        console.log(`🎉 ONARIM TAMAMLANDI! ${filePath} üzerine yazıldı. Fast Refresh tetikleniyor...`);

        res.json({ success: true, message: 'Onarım tamamlandı.' });

    } catch (error) {
        console.error('Sunucu Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Forge Local Server 3000 portunda çalışıyor...');
    console.log('Uygulama içindeki [🤖 Otonom Düzelt] butonuna bastığınızda işlemler burada görünecektir.');
});
