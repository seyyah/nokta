Track: B

# NoktaApp — Nokta Audit Forge Mission
**Öğrenci No:** 241478108  
**Slug:** dot-capture  
**Repo:** https://github.com/ParzivalSANN/nokta_seyyah/tree/nokta-audit-forge

## Proje Bilgileri
- **Expo QR / Link:** [https://expo.dev/accounts/ruthlesscat/projects/app/updates/6e788084-60d6-4f51-a979-5e8eb61a0396](https://expo.dev/accounts/ruthlesscat/projects/app/updates/6e788084-60d6-4f51-a979-5e8eb61a0396)
- **Demo Video:** [https://youtube.com/shorts/jiBsw8_ekiU?si=OeiK9MbthMDIs9V5](https://youtube.com/shorts/jiBsw8_ekiU?si=OeiK9MbthMDIs9V5)
- **Kullanılan AI Tool:** Groq API (llama-3.3-70b-versatile — Forge server / LLM repair), Gemini CLI (Gemini 2.5 Flash — mimari tasarım), Kilo (Code Assistant — dosya yapısı, ledger, teslimat)
- **Human Touch Points:** 3
  - Cycle 2'de glow yoğunluğu onayı
  - Cycle 4'te KeyboardAvoidingView çakışması fark edilip rollback kararı verilmesi
  - Cycle 6'da otonom tema çıktısını review etme

## Track B Seçimi: Yaratıcılık — Tasarım Asistanı
Bu projede Track B seçilmiştir. Audit widget sadece bir bug-raporlama aracı değil, aynı zamanda bir **Tasarım Stüdyosu** olarak kullanılmaktadır. Kullanıcı "bu renk hoş değil", "sembol çok küçük", "burası çok sade" gibi sübjektif tasarım eleştirilerini widget ile işaretler ve coding agent bu eleştirileri UI koduna otonom olarak işler. Detaylar için `IDEA.md`.

## Decision Log (Karar Günlüğü)
- **Track B Seçimi:** Klasik bug-fix döngüsünden ziyade, kullanıcının doğrudan tasarım ve UX taleplerini agent'a ilettiği bir "müşteri-geliştirici" kurgusu tercih edildi. `IDEA.md` detaylarında bu vizyon açıklanmaktadır.
- **Rollback Kararı (Cycle 4):** ProcessingScreen'de KeyboardAvoidingView eklenmesi, `expo-blur` + `react-native-reanimated` ile çakışarak fast-refresh loop oluşturdu. Expo Go ortamında stabil çalışmadığı için değişiklikler geri alındı. Bu, native davranışların Expo Go sınırlamalarını anlamak için değerli bir başarısız hipotez oldu.
- **Tasarım Dili Revizyonu (Cycle 6):** Kullanıcının "premium his yok" eleştirisine yanıt olarak, Ethereal Amethyst teması glassmorphism + derin mor tonlarına evrildi. Agent bu değişikliği tam otonom olarak gerçekleştirdi.
- **Forge Pipeline (Cycle 7):** Node.js `http` sunucusu (`forge-server.js`) + Groq API ile otonom UI repair pipeline kuruldu. Diff-based strateji ile büyük dosyalarda sadece değişen bölge SEARCH/REPLACE yapılarak tüm dosyanın yanlış rewrite edilmesi engellendi. VisionScreen'de "Onayla ve Uygula" butonu ile simülasyon modu eklendi; sunucu çalışmadığında bile demo amaçlı geçiş gösterilebiliyor.
- **Drop-in Disiplini:** Audit widget `App.js`'te tek satırda mount ediliyor. `grep -r 'AuditWidget' app/` sadece `App.js`'te bir import ve bir JSX kullanımı döndürüyor. Widget kaldırıldığında app çalışmaya devam eder.
- **Vision Screen Bonus:** Arkadaşın reposundan ilham alınarak, Before/After karşılaştırma + AI analiz ekranı eklendi. Bu, audit raporlarının sadece metin olmadığını, visual ground truth taşıdığını kanıtlar.

## AI Tool Log
- **Groq API (llama-3.3-70b-versatile):** Forge server (`forge-server.js`) Groq API ile otonom UI repair gerçekleştirir. Diff-based strateji: büyük dosyalarda keyword tespiti + ±2000 kararlık pencere + SEARCH/REPLACE blok parse edilerek sadece değişen bölge güncellenir. Model `llama-3.3-70b-versatile` seçildi çünkü `llama3-70b-8192` Groq tarafından decommission edilmişti.
- **Gemini CLI (Gemini 2.5 Flash):** Projenin mimari tasarımı, audit widget entegrasyonu, VisionScreen analiz ekranı ve otonom tema revizyonu Gemini CLI ile interaktif olarak yürütüldü.
- **Kilo (Code Assistant):** Dosya yapısı düzenleme, audit raporları oluşturma, FORGE.md ledger yazımı, git rebase/force-push operasyonları ve teslimat hazırlığı Kilo üzerinden yapıldı.
- **Karpathy/Autoresearch Felsefesi:** Kod yazımında bağlamsal (context-aware) üretim tercih edildi; prompt mühendisliği yerine mevcut kodbase'i anlayarak minimal diff prensibi uygulandı.
- **Expo SDK:** Uygulamanın hızlı prototiplenmesi ve deploy edilmesi için kullanıldı.

## Self-Check Listesi
- [x] `README.md` ilk satırında `Track: B` var
- [x] `app/` altında çalışır Expo projesi + audit widget mount
- [x] `audit-reports/` altında 3 burn-in'li `.md` rapor
- [x] `FORGE.md` ledger: 5 başarılı + 1 rollback + 1 Forge Pipeline cycle
- [x] `app-release.apk` var
- [x] Decision log + human touch points + AI tool log README'de
- [x] `IDEA.md` eklendi (Track B zorunlu)
- [x] Root dizine dokunulmadı, sadece `submissions/20260416-dot-capture/` altı commit'li
