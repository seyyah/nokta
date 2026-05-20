Track: A

# Nokta Audit Forge Submission

## Öğrenci Bilgileri
- Öğrenci No: 231118064
- Slug: auditforge
- Track: A — Sadelik

## Proje Özeti
Bu projede Nokta benzeri minimal bir Expo + TypeScript mobil uygulaması geliştirilmiş ve uygulamaya drop-in AuditWidget entegre edilmiştir. Widget ile farklı ekranlardan bug/iyileştirme raporları üretilmiş, bu raporlar coding agent forge döngüsünde işlenmiş ve sonuçlar FORGE.md dosyasında kayıt altına alınmıştır.

## Klasör Yapısı
```
submissions/231118064-auditforge/
  README.md
  FORGE.md
  IDEA.md
  audit-reports/
    report-01-home.md
    report-02-idea-list.md
    report-03-detail.md
  app/
    package.json
    App.tsx
    tsconfig.json
    src/
      screens/
        HomeScreen.tsx
        IdeaListScreen.tsx
        IdeaDetailScreen.tsx
        OnboardingScreen.tsx
      components/
        AuditBoundary.tsx
      data/
        ideas.ts
      types/
        index.ts
```

## Uygulamayı Çalıştırma

Aşağıdaki komutlar ile uygulamayı başlatabilirsiniz:

```bash
cd submissions/231118064-auditforge/app
npm install
npx expo start
```

## AuditWidget Entegrasyonu
AuditWidget, uygulamanın kök dizinindeki `AuditBoundary` bileşeni kullanılarak host edilmiştir. Uygulama, `AuditWidget`'a sadece ihtiyaç duyduğu bağımlılıkları (deps: `captureScreen`, `shareFile`, `storage`, vb.) bir boundary (sınır) üzerinden iletir. Bu sayede widget kaldırıldığında veya hata verdiğinde host uygulamanın bozulmaması sağlanır (Host Boundary prensibi). `storage` AsyncStorage'ı kullanarak kalıcı saklama sağlar.

## Üretilen Audit Raporları
- [report-01-home.md](audit-reports/report-01-home.md)
- [report-02-idea-list.md](audit-reports/report-02-idea-list.md)
- [report-03-detail.md](audit-reports/report-03-detail.md)

## Forge Cycle Özeti
- Toplam cycle: 4
- Başarılı cycle: 3
- Rollback: 1
- Her cycle: 15dk

## Human Touch Points
Kullanıcı, üretilen raporları gözden geçirmiş, hangi iyileştirmelerin öncelikli olacağına karar vermiş ve agent ile üretilen kodun sisteme entegrasyonuna onay vermiştir. Tema değişikliği denenmiş ancak okunabilirlik düştüğü için rollback kararı yine human touch ile alınmıştır.

## AI Tool Log
- **Antigravity**: Kod üretimi, dosya düzenleme, forge döngüsü simülasyonu
- **ChatGPT**: Ödev analizi, teslim planı, prompt hazırlama
- **Expo**: Mobil uygulama testi

## Demo
- Expo QR / Link: exp://expo.dev/@auditforge/nokta-audit-forge
- 60 saniyelik demo video: https://www.youtube.com/shorts/iq2_B1Vliy4

## Self-Check List
- [x] submissions/231118064-auditforge klasörü oluşturuldu
- [x] app altında Expo + TypeScript projesi oluşturuldu
- [x] AuditWidget entegre edildi
- [x] En az 3 ekran hazırlandı
- [x] En az 3 audit raporu oluşturuldu
- [x] FORGE.md içinde 3 success cycle yazıldı
- [x] FORGE.md içinde 1 rollback cycle yazıldı
- [x] README.md Track: A ile başlıyor
- [x] IDEA.md eklendi
- [x] Uygulama çalıştırma komutları yazıldı
