# Fikir — Nokta Expert Support (Track A Dilimi)

## Problem

Yeni başlayan geliştiriciler, girişimciler ve teknik kullanıcılar bir tıkanıklığa girdiklerinde:

- Hangi alandan uzmana ulaşmaları gerektiğini bilmiyor,
- Sorularını net bir brief/spec hâline getiremiyor,
- Genel-amaçlı AI cevaplarıyla yetinmek zorunda kalıyor,
- Sonuçta saatlerce / günlerce kaybediyor.

## Çözüm Önerisi (Track A — Dot Capture & Enrich Dilimi)

Kullanıcı ham bir problem cümlesi yazar; sistem bu noktayı dört adımda zenginleştirip tek sayfa bir özete (spec) dönüştürür:

1. **Capture** — Kullanıcı problem text'ini Chat ekranına yazar. (Tek input, ham fikir noktası.)
2. **Route** — Nokta Mascot anahtar kelime tabanlı analizle 8 uzman alanından birini (veya genel fallback'i) belirler ve uygun mentor profilini eşleştirir.
3. **Enrich** — Escalation kabul edilince Groq destekli (`llama-3.3-70b-versatile`) AI mentor sohbeti açılır. Mentor problemi netleştirici sorularla derinleştirir: kullanıcı, kapsam, kısıtlar, hedef.
4. **Spec** — Görüşme sona erince oturum özeti (problem + alınan tavsiyeler + sonraki adımlar) otomatik üretilir ve geçmişe kaydedilir.

## Track A Eşleşmesi

| Track A adımı | Bu Projedeki Karşılığı |
|---|---|
| Ham fikri al (text) | Chat ekranında problem text input |
| AI ile 3–5 mühendislik sorusu | Mentor ekranındaki Groq destekli sohbet |
| Tek sayfa spec üret | Summary ekranındaki otomatik oturum özeti |

## Bu Diferansiyatör Neden Önemli?

Track A'nın klasik "tek bir AI'a sor → spec al" akışı yerine:

- **Alan odaklı routing**: 8 uzmanlık alanı + her biri için ayrı system prompt → cevaplar generic değil, alan diliyle.
- **Escalation lifecycle** (`pending → accepted → resolved`): bir nokta sorulup unutulmuyor; durum takibi var.
- **Auto-accept hook + bildirim banner'ı**: kullanıcı eşleşme olduğunda anında "Mentor Eşleşti!" feedback'i alıyor.
- **Demo Mode**: API key olmadan da hazır mock cevaplarla deneyimlenebilir; eğitim/test senaryoları için ideal.
- **Offline-first**: AsyncStorage ile internet kesilse bile geçmiş özetlere erişim açık.

## Kapsam Dışı (Scope Out)

Track A'nın 2 saatlik süresine sığabilmesi için bilinçli olarak şunlar yapılmadı:

- Spec'in Markdown / PDF export'u
- Çoklu uzman paneli (collaborative session)
- Kullanıcı doğrulaması / hesap sistemi
- Bulut senkronizasyonu

## Mimari Özet

- **Expo SDK 54 + React Native 0.81 + TypeScript (strict)**
- **Navigation**: Native Stack + Bottom Tabs (Home / Chat / Status / Mentor / Summary / History)
- **State**: React hooks (`useEscalations`, `useAutoAccept`)
- **Storage**: AsyncStorage üzerinden `storageHelper`
- **Services**: `expertRouter` (keyword routing), `grokService` (AI), `escalationService` (lifecycle), `summaryService` (spec üretimi), `mockMascotService` (Mascot davranışı)