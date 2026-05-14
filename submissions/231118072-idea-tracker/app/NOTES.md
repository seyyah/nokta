# Expo Uygulaması — Geliştirme Notları

## Kurulum

```bash
cd submissions/231118072-idea-tracker/app
npm install
npx expo start
```

## Klasör Yapısı

```
app/
├── app/
│   ├── _layout.tsx     ← Stack navigator kökü
│   ├── index.tsx       ← Ana ekran (ham fikir girişi)
│   ├── questions.tsx   ← 5 adımlı engineering soruları wizard'ı
│   └── spec.tsx        ← Spec belgesi ekranı (kaydet + paylaş)
├── constants/
│   └── questions.ts    ← 5 sabit engineering sorusu
├── types/
│   └── index.ts        ← TypeScript tipleri
├── app.json            ← Expo yapılandırması
├── babel.config.js     ← Babel yapılandırması
├── package.json        ← Bağımlılıklar (Expo SDK 51)
└── tsconfig.json       ← TypeScript yapılandırması
```

## Uygulama Akışı

```
index.tsx (Fikir Girişi)
    │  Ürün adı + ham fikir metin
    ▼
questions.tsx (5 Engineering Sorusu)
    │  Her soru için fade+slide animasyonu
    │  1. Problem Nedir?
    │  2. Hedef Kullanıcı Kim?
    │  3. MVP Kapsamı Nedir?
    │  4. Kısıtlar Neler?
    │  5. Çözüm Yaklaşımı?
    ▼
spec.tsx (Spec Belgesi)
    │  Otomatik AsyncStorage'a kaydeder
    │  Paylaş (Share API)
    └─ Yeni Fikir → index.tsx
```

## Kullanılan Teknolojiler

| Paket | Amaç |
|-------|------|
| `expo ~51` | Ana framework |
| `expo-router ~3.5` | File-based navigation |
| `@react-native-async-storage/async-storage` | Local veri saklama |
| `react-native-safe-area-context` | Güvenli alan yönetimi |
| TypeScript | Tip güvenliği |

## Expo Go ile Test

1. [Expo Go](https://expo.dev/client) uygulamasını telefonunuza indirin
2. `npx expo start` komutunu çalıştırın
3. QR kodu Expo Go ile tarayın
