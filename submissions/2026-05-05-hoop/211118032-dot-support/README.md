# Nokta Expert Support — Track A Teslimi

**Seçilen Track:** Track A — Dot Capture & Enrich
**Geliştirici:** Beyza Gül Demir (211118032)
**Slug:** dot-support

## Proje Özeti

Kullanıcı bir problem yazar; **Nokta Mascot** anahtar kelime analiziyle uygun uzman alanını belirler ve mentor eşleştirmesi başlatır. Uzman kabul edince Groq destekli gerçek zamanlı mentor görüşmesi açılır; görüşme bittiğinde **tek sayfa spec niteliğinde oturum özeti** otomatik üretilir.

Bu submission, Track A'nın **"ham fikri al → AI sorularıyla zenginleştir → tek sayfa spec üret"** akışını, **uzman/mentor routing'i** üzerinden somutlaştıran bir versiyondur.

## Proje Bağlantıları

- **APK İndir:** [app/app-release.apk](./app/app-release.apk)
- **Expo Build:** https://expo.dev/accounts/beyzaguldemirr/projects/nokta-expert-support/builds/40e57915-1441-4fff-baf1-cfc559e4675a

## Akış

1. **Home** — "Yeni Sohbet Başlat" veya "Taleplerim" ekranına geçiş
2. **Chat** — Nokta Mascot ile sohbet; kullanıcı problemini yazar
3. **Routing** — Anahtar kelime analiziyle uygun uzman alanı belirlenir
4. **Status / Taleplerim** — Escalation durumu (`pending → accepted → resolved`) izlenir
5. **Mentor** — Uzman kabul ettiğinde Groq destekli AI mentor sohbeti
6. **Summary** — Görüşme özeti otomatik üretilir
7. **History** — Önceki tüm görüşmeler ve özetler saklanır

## Özellikler

- 8 farklı uzman alanı için anahtar kelime tabanlı routing
- Groq API ile gerçek zamanlı mentor cevapları (`llama-3.3-70b-versatile`)
- Escalation lifecycle: `pending → accepted → resolved`
- Auto-accept hook + "Mentor Eşleşti!" bildirim banner'ı
- Oturum sonu özet üretimi (tek sayfa spec)
- Offline-first geçmiş kayıtları (AsyncStorage)
- **Demo Mode** — API key yoksa hazır mock cevaplarla çalışır

## Uzman Alanları

| Alan | Uzman |
|------|-------|
| Algoritma & Veri Yapıları | Burak Şahin |
| Startup & Ürün Stratejisi | Elif Demir |
| Yatırım & Finansman | Mert Kaya |
| Veritabanı & Backend | Ayşe Yıldız |
| Siber Güvenlik | Can Arslan |
| Yazılım Mimarisi | Deniz Öztürk |
| Teknoloji Hukuku | Selin Çelik |
| Dijital Sağlık | Dr. Yusuf Akar |
| Genel Danışmanlık (fallback) | Zeynep Turan |

## Teknolojiler

- **Expo** SDK 54 / **React Native** 0.81
- **TypeScript** (strict mode)
- **React Navigation** — Native Stack + Bottom Tabs
- **Groq API** — `llama-3.3-70b-versatile`
- **AsyncStorage** — yerel veri saklama

## Kurulum

cd app
npm install
