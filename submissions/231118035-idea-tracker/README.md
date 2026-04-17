# Idea Tracker — 231118035

## Seçilen Track

**Track A** — Ham fikri (metin veya ses) alır, AI ile 3-5 engineering sorusu sorar (problem, user, scope, constraint), tek sayfa spec üretir.

## Öğrenci Bilgileri

- **Öğrenci Numarası:** 231118035
- **GitHub:** https://github.com/dilfinakkurt
- **Fork:** https://github.com/dilfinakkurt/nokta

## Expo QR Kodu

Uygulamayı Expo Go ile çalıştırmak için:

```
npx expo start
```

veya aşağıdaki QR kodu Expo Go uygulamasıyla taratın:

> **QR Kod:** Expo Go uygulamasını açın → "Scan QR Code" → Dev sunucunuzdaki QR kodu taratın.

Expo Go linki (geliştirme ortamında): `exp://<LOCAL_IP>:8081`

## 60 Saniye Demo Video

Demo videosu çekimi tamamlandıktan sonra buraya eklenecektir.

> **Demo Video:** [YouTube / Google Drive linki buraya eklenecek]

Videoda gösterilecekler:
1. Uygulama açılış ekranı
2. Ham fikir girişi
3. Engineering soruları yanıtlama
4. Spec çıktısı görüntüleme
5. Spec'i kaydetme ve paylaşma

## Decision Log

### Neden Track A?

Track A'yı seçmemin temel nedeni, fikir üretme ve yapılandırma sürecinin en kritik ama en az dikkat edilen aşama olmasıdır. Çoğu geliştirici bir fikre sahip olduğunda hemen koda atlamak ister; ancak fikri doğru yapılandırmadan yazılan kodun büyük kısmı ileride yeniden yazılmak zorunda kalır.

**Neden bu fikri (Idea Tracker)?**

Yazılım geliştirici olarak kendinize veya ekibinize yöneltmeniz gereken doğru soruları sormak — gerçek problemi bulmak, kullanıcıyı tanımlamak, kapsamı daraltmak — başarılı bir proje için zorunludur. Bu uygulamayı seçmemin nedenleri:

1. **Kişisel ihtiyaç:** Kendi projelerimde fikirleri yapılandırmakta zorlandığım zamanları yaşadım. Aklımdaki ham fikri hızlıca bir spec'e dönüştürebilecek bir araç istiyordum.

2. **Pratik değer:** Bireysel geliştiricilerden startup ekiplerine kadar herkesin kullanabileceği, gerçekten faydalı bir araç olması.

3. **Track A'nın gücü:** Sadece not almak değil, AI destekli sorgulama ile fikrin zayıf noktalarını baştan ortaya çıkarmak. "5 Whys" tekniğinin yazılım geliştirmeye uyarlaması.

4. **Öğrenme hedefi:** React Native, AsyncStorage, ve kullanıcı akışı tasarımı konularını pratikte uygulamak.

### Teknik Kararlar

- **Expo SDK 52:** Expo Go uyumluluğu ve geniş kütüphane desteği için.
- **TypeScript:** Tip güvenliği ve daha az runtime hatası için.
- **AsyncStorage:** Sunucu bağımlılığı olmadan yerel veri saklama için.
- **expo-router:** File-based routing ile temiz navigasyon için.
- **Hardcoded engineering soruları:** İlk versiyonda AI entegrasyonu yerine sabit, iyi tasarlanmış sorular kullanarak kullanıcı akışını doğrulamak için.
