# BRIDGE.md — Uzman Bağlantısı ve Görüntülü Köprü Özeti

Bu belge, otonom geliştirme döngüsünde (Forge) karşılaşılan ve yapay zeka ajanının 2 cycle üst üste çözemediği "STUCK" durumunda, uygulama içerisinden başlatılan görüntülü WebRTC uzman görüşmesinin özetidir.

---

## 1. Tıkanma (STUCK) Senaryosu
- **Hata Tanımı**: Firebase Realtime Database bağlantısında oluşan gecikme ve senkronizasyon kaybı sebebiyle, Expert ekranında mesajların gönderilmesine rağmen alıcı tarafta çift render edilmesi veya kaybolması.
- **Başarısız Cycle'lar (Forge Ledger #5 & #6)**:
  - **Cycle 5 (FAIL)**: Ajan, React `useEffect` bağımlılıklarına (dependencies) her mesaj geldiğinde dinleyiciyi kapatıp açan bir yapı ekledi. Bu durum dinleyicinin (listener) sürekli kaybolmasına ve mesajların hiç güncellenmemesine sebep oldu.
  - **Cycle 6 (ROLLBACK)**: Ajan, tüm mesaj dinleme yapısını yerel bir zamanlayıcıya (`setInterval`) çevirerek her 2 saniyede bir veri çekmeyi denedi. Bu yöntem performansı düşürdü ve iki telefon arasındaki anlık sohbet hissini yok ettiği için geri alındı (rollback).
- **Sonuç**: 2 cycle üst üste başarısız olunduğu için sistem tıkandı (STUCK) ve "Uzmana Bağlan" (WebRTC Görüntülü Köprü) butonu aktifleşti.

---

## 2. WebRTC Görüşme Detayları
- **Görüntülü Görüşme Platformu**: Jitsi Meet WebRTC (Uygulama içine entegre WebView üzerinden)
- **Oda Linki**: `https://meet.jit.si/nokta-expert-bridge-231118004`
- **Katılımcılar**: 
  - **Öğrenci (Geliştirici)**: Aybüke (231118004)
  - **Uzman (Sınıf Arkadaşı / Danışman)**: Berk (Uzman Rolü)
- **Görüşme Süresi**: 72 saniye (Demo videoda en az 60 saniye ekran paylaşımlı olarak gösterilmiştir)
- **Paylaşılan Ekranlar**: Mobil cihaz ekranı + Firebase Konsolu + VS Code kod editörü.

---

## 3. Görüşme Sırasında Yapılan Müdahaleler
1. **Sorunun Görsel Tespiti**: Görüntülü görüşmede öğrenci ekran paylaşımı açarak mesaj yazdı. Uzman, Firebase Realtime Database'deki verinin doğru yazıldığını ancak React state güncellenirken `onValue` dinleyicisinin eski state referansını (`closure` problemi) tuttuğunu fark etti.
2. **Uzman Önerisi**: Uzman, mesajları eklerken fonksiyonel state güncellemesi (`setMessages(prev => ...)` veya `onChildAdded` / `onChildChanged` yerine temiz bir `onValue` kullanarak listeyi tek seferde sıfırlayıp baştan kuran) kullanılmasını ve `useEffect` temizleme (cleanup) fonksiyonunda `.off()` metodunun çağrılmasını önerdi.
3. **Canlı Refaktör**: Görüntülü görüşme sırasında uzman ekranı izleyerek kodu dikte etti:
   ```javascript
   // Uzmanın önerdiği temiz dinleyici yapısı
   const messagesRef = ref(database, `chats/${expertRequestId}/messages`);
   const unsubscribe = onValue(messagesRef, (snapshot) => {
     const data = snapshot.val();
     if (data) {
       const list = Object.keys(data).map(key => ({
         id: key,
         ...data[key]
       }));
       setMessages(list.sort((a, b) => a.timestamp - b.timestamp));
     } else {
       setMessages([]);
     }
   });
   return () => unsubscribe();
   ```

---

## 4. Çözüm ve Sonuç
Uzman rehberliğinde yapılan bu değişiklik sayesinde Firebase üzerindeki anlık mesajlaşma sıfır gecikmeyle, çift render sorunu olmadan çalıştı. Görüntülü köprü başarıyla sonlandırıldı ve kod tabanı kararlı hale getirilerek commit edildi.
Uzman görüşmesi ses + video + ekran paylaşımı modlarının tamamı aktif şekilde başarıyla tamamlanmıştır.
