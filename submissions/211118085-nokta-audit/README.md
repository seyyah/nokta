Track: B

# Nokta Audit — 211118085

## Uygulama Hakkında
Nokta, kullanıcının fikirlerini 4 departman (Pazarlama, Teknik, Finans, Risk) gözünden analiz eden ve kurumsal karar üreten bir mobil uygulamadır. Kullanıcı fikrini yazar, sistem her departmanın bakış açısından değerlendirme yapar ve sonunda bir yatırım skoru ile kurumsal karar üretir. `@xtatistix/mobile-audit` widget'ı drop-in olarak entegre edilmiştir. Backend yok, hesap yok, telemetri yok.

## Demo Video
https://youtube.com/shorts/vKSz9qZ7YGw?feature=share

## Expo Link
https://expo.dev/accounts/ravzanur/projects/nokta-audit/updates/30e41fc2-b343-4f34-bbbf-a60ddc92e90b

## APK
https://drive.google.com/file/d/1vEnmG29_m8woAZrYK1g6ogBERaMxZ6jG/view?usp=sharing

## Track: B — Yaratıcılık
Nokta kullanıcısı hem müşteri hem geliştiricidir. Kendi fikrini analiz ettirirken UX'te bir sorun görürse FAB'a basar, ekranı yakalar, sarı burn-in kutusuyla sorunu işaretler, not yazar. Üretilen `.md` raporu OpenCode'a input olarak verilir. Agent raporu okur, ilgili bileşeni bulur, fix uygular, commit atar. İnsan sadece review eder. Bu "müşterinin geliştirici olduğu" döngünün somut ve çalışır örneğidir.

## Kullanılan AI Araçları
- **OpenCode**: Forge cycle'ları — kod okuma, fix uygulama, commit atma
- **Claude (claude.ai)**: Widget entegrasyonu, hata ayıklama, dokümantasyon yardımı

## Human Touch Points: 4
1. Audit raporunu OpenCode'a verdim
2. Rollback komutunu verdim
3. FORGE.md oluşturmasını istedim
4. expo-file-system/legacy hatasını manuel çözdüm

## Decision Log
- `expo-file-system` yeni versiyonda deprecated → `/legacy` import ile çözüldü
- `captureRef` sorunu → `AuditSelector.tsx`'te `onConfirm` boş URI ile de devam edecek şekilde düzenlendi
- Track B seçildi: Nokta'nın fikir analizi use case'i müşteri-geliştirici döngüsüne doğal uyum sağlıyor
- OpenCode kullanıldı: Claude Code ücretli olduğu için ücretsiz alternatif tercih edildi
- APK 54MB olduğu için GitHub'a yüklenemedi, Drive linki eklendi