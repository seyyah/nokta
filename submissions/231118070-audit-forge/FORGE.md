\# FORGE.md



\## Cycle 1 — SUCCESS



Timebox: 20 dk



READ:

Voice visualizer ekranında kullanıcı konuşma durumunu görmek istiyor.



LOCATE:

Ana ekran içindeki VoiceVisualizer bileşeni.



HYPOTHESIZE:

Ses girişini RMS/FFT mantığıyla bar animasyonuna bağlamak kullanıcıya canlı geri bildirim sağlar.



REPAIR:

Bar animasyonu eklendi. Konuşma simülasyonu ile barlar hareket ediyor.



TEST:

Butona basıldığında barların hareket ettiği doğrulandı.



VERIFY:

Sessizlik durumunda barlar küçülüyor, konuşma durumunda canlanıyor.



RESULT:

SUCCESS



\---



\## Cycle 2 — SUCCESS



Timebox: 20 dk



READ:

Avatar ekranında konuşma anında dudak hareketi görünmeli.



LOCATE:

AvatarScene bileşeni.



HYPOTHESIZE:

Viseme pipeline mantığı basit ağız aç/kapat animasyonu ile temsil edilebilir.



REPAIR:

Avatar yüzü ve lipsync test butonu eklendi.



TEST:

Lipsync Test butonuna basıldığında ağız açık/kapalı animasyonu çalıştı.



VERIFY:

Avatar bekleme ve konuşma durumu görsel olarak ayrışıyor.



RESULT:

SUCCESS



\---



\## Cycle 3 — ROLLBACK



Timebox: 20 dk



READ:

Gerçek zamanlı mikrofon FFT entegrasyonu denenmek istendi.



LOCATE:

VoiceVisualizer bileşeni.



HYPOTHESIZE:

expo-av üzerinden canlı mikrofon verisi alınarak barlar gerçek RMS ile oynatılabilir.



REPAIR:

Canlı mikrofon entegrasyonu planlandı.



TEST:

Emulator ortamında mikrofon izinleri ve canlı ses verisi stabil çalışmadı.



VERIFY:

Demo güvenilirliği için simülasyon yaklaşımı korundu.



RESULT:

ROLLBACK



\---



\## Cycle 4 — STUCK → EXPERT BRIDGE



Timebox: 20 dk



READ:

Avatar lipsync ile gerçek ses verisinin tam senkron bağlanması istendi.



LOCATE:

AvatarScene ve VoiceVisualizer bileşenleri.



HYPOTHESIZE:

Aynı audio state hem bar animasyonunu hem avatar ağız hareketini tetikleyebilir.



REPAIR:

Tek state ile senkron simülasyon denendi.



TEST:

Gerçek viseme datası olmadığı için tam lipsync kalitesi doğrulanamadı.



VERIFY:

Cycle stuck olarak işaretlendi ve uzman bağlantısı açıldı.



RESULT:

STUCK → BRIDGE

