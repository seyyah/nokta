<<<<<<< HEAD
Idea Tracker — 231118056
Öğrenci Bilgileri
Öğrenci Numarası: 231118056
GitHub: github.com/sibel464
Fork: https://github.com/sibel464/idea-tracker
Seçilen Track: Track A — Idea to Spec
Ham fikri (metin) alır, kullanıcıya 5 mühendislik sorusu (Problem, User, Scope, Constraint, Solution) sorar ve tek sayfalık spec çıktısı üretir.

Uygulama Linkleri
Expo QR Kodu
exp://833ff2c9-701f-4549-837c-87465949ff56-00-3312sltxjuicf.expo.spock.replit.dev
Geliştirme ortamında uygulamayı Expo Go ile test etmek için:

Expo Projesi: https://expo.dev/accounts/sibel464/projects/idea-tracker
QR Kod: Expo CLI başlatıldığında terminalde gösterilen QR kodu Expo Go uygulamasıyla taranabilir
APK Build: EAS Build üzerinden Android APK üretilmiştir
Demo Video (60 saniye)
Demo Link: https://youtube.com/shorts/YWNGAwn_HII
Demo video, uygulamanın 3 ana akışını gösterir: (1) Fikir girişi, (2) 5 soruyu adım adım cevaplama, (3) Otomatik spec oluşturma ve kopyalama.

Decision Log
Neden Track A?
Yazılım geliştirme sürecinde en kritik adım, ham fikri net bir spesifikasyona dönüştürmektir. Çoğu proje fikir aşamasında belirsiz kalır ve yanlış yönde geliştirilir. Track A, bu problemi yapılandırılmış bir soru-cevap akışıyla çözüyor — kullanıcı doğru soruları cevaplayarak hem fikrini netleştiriyor hem de ileride başvurabileceği bir doküman elde ediyor.

Neden Bu Fikir?
"Bir projeye başlamak istiyorum ama nereden başlayacağımı bilmiyorum" problemi evrensel. Engineering soruları (problem ne?, kim kullanacak?, kapsam ne?, kısıtlar ne?, nasıl çözülür?) bir düşünce çerçevesi sağlıyor. Bu çerçeve sayesinde kullanıcı sadece düşünmüyor, aynı zamanda dokümante de ediyor.

Teknik Kararlar
Karar	Gerekçe
AsyncStorage	Backend gerektirmeden cihazda kalıcı veri saklama
Expo Router	Native sayfa geçişleri, file-based routing
TypeScript	Tip güvenliği ve daha okunabilir kod
Hardcoded sorular	MVP'de AI bağımlılığı olmadan hızlı çalışan bir akış
Expo SDK 54+	En güncel Expo özellikleri ve Expo Go uyumluluğu
Inter font ailesi	Modern, okunabilir tipografi
Klasör Yapısı
submissions/231118056-idea-tracker/
├── README.md          # Bu dosya
├── idea.md            # Track A fikir belgesi ve spec
└── app/               # Expo projesi referansı
                       # (Gerçek kod: artifacts/idea-tracker/)
=======
# NOKTA — NAIM's Orchestrated Knowledge-To-Artifact

![NOKTA](assets/nokta.jpeg)

> The spec layer of the NAIM loop. NAIM builds. NOKTA thinks first.

**1 file. 0 human review. CI decides.**

Nokta is part of the [NAIM](https://github.com/seyyah/naim) ecosystem — Naim Agentic Iterative Mobile. NAIM iterates on apps; NOKTA defines what to build before the first line of code.

A single idea spark — a dot — enters the system. Guided LLM questioning expands it into a structured product spec. Dot. Line. Paragraph. Page.
>>>>>>> fe7526c3680653f13c73ae914badf09b84be5147
