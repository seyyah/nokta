# NOKTA Audit Forge — 231118043

**Öğrenci:** 231118043  
**Track:** A — Sadelik (drop-in disiplini)  
**Expo Project:** https://expo.dev/@erenn.altay1/nokta-audit-forge  

---

## Ne yaptım?

Nokta Dot Capture uygulamasına (`submissions/231118043-dot-capture`) `@xtatistix/mobile-audit` widget'ını drop-in olarak ekledim. Widget **tek bir yerde** mount edildi — `App.tsx` root'unda. Kaldırmak için o tek satırı silmek yeterli.

**Akış:**
1. `AuditWidget` App.tsx'e drop-in mount, `currentScreen` navigation state'ten dinamik besleniyor
2. 3 ekranda (Home, Questions, Spec) bug raporları kaydedildi → `audit-reports/` klasörü
3. Her rapor Claude Code'a verildi, `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT` döngüsü koşuldu
4. FORGE.md'ye loglandı: 3 başarılı + 1 rollback

---

## Demo

**60 saniyelik demo video:** https://youtube.com/shorts/Go5Sug4MkNo?feature=share  
**Expo Go:** `exp://exp.host/@erenn.altay1/nokta-audit-forge`

---

## Track A — Sadelik Kanıtı

| Metrik | Değer |
|---|---|
| Widget mount noktası | 1 (App.tsx root) |
| Ortalama cycle diff | 2.3 satır |
| Widget kaldırma adımı | 1 satır silme |
| Eklenen bağımlılık | 0 (sadece peer deps) |

Widget'ı kaldırmak için:
```tsx
// App.tsx'ten şu bloğu sil:
<AuditWidget ... />
// + 4 import satırı
```

---

## Çalıştırma

```bash
cd app
cp .env.example .env.local
# EXPO_PUBLIC_GEMINI_API_KEY ekle (https://aistudio.google.com/apikey)
npm install
npx expo start
```

---

## Decision Log

**Karar 1 — Track A (Sadelik)**  
Widget gerçekten drop-in mi? Bunu kanıtlamak için minimum diff ve tek mount noktası disiplini seçildi.

**Karar 2 — App.tsx root mount**  
Widget'ı her ekrana ayrı ayrı eklemek yerine NavigationContainer içinde tek yerde mount ederek `currentScreen` props'u navigation state'ten besleniyor. Bu Track A'nın özüdür.

**Karar 3 — expo-file-system legacy API**  
expo-file-system v18 breaking change — `documentDirectory` ve `EncodingType` artık `expo-file-system/legacy` altında. Buna göre import güncellendi.

**Karar 4 — Cycle 4 rollback**  
Paylaş butonunu footer'a taşımak küçük ekranlarda layout overflow riski taşıyordu. Track A disiplininde risk/fayda dengesi rollback'i gerektirdi.

**Karar 5 — AI araçlar**  
Claude Code CLI (claude-sonnet-4-6) tüm forge döngüleri için kullanıldı. Gemini 2.5 Flash uygulama içi AI için kullanıldı (ücretsiz).

---

## İnsan Dokunuş Sayısı: 1

Cycle 4 rollback kararı (layout overflow risk değerlendirmesi).
