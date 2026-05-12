# 231118040 - Nokta Human Assist

## Track Selection

Chosen track: **Track A - Dot Capture & Enrich**

Bu submission, eski Nokta Mascot fikrini Expo / React Native mobil akışa taşır. Kullanıcı ham fikri girer, uygulama 5 engineering soru sorar, tek sayfa spec üretir ve belirsizlik kaldığında insan desteği devir paketi hazırlar.

## Links

- QR artifact: [expo-qr.png](./expo-qr.png)
- Demo video: [demo.mp4](./demo.mp4)
- Demo poster: [demo-poster.png](./demo-poster.png)
- APK: [app-release.apk](./app-release.apk)
- Expo app source: [app/](./app)

## What I Built

Nokta Human Assist, 3D web mascot yaklaşımını mobilde 2D animasyonlu bir maskot ve güven odaklı handoff mantığıyla yeniden yorumlar.

Ana akış:

1. Text idea veya voice transcript ile giriş.
2. Problem, user, scope, constraint ve success signal için 5 soru.
3. Tek sayfa spec üretimi.
4. İstenirse veya güven düşükse human support handoff ekranı.

## Human Support Capability

Bu submission'daki ek capability, AI cevabını zorlamadan insan desteğine devir hazırlamasıdır. Uygulama, handoff sırasında queue id, özet, önerilen aksiyon, ETA ve insan inceleyiciye gidecek notları tek ekranda üretir.

## Expo / QR

Repo içinde QR görseli bulunmaktadır. QR, bu branch üzerindeki release APK bağlantısına gider ve mobil cihazdan kurulum akışını hızlandırır.

## Decision Log

1. Track olarak A seçildi; çünkü eski maskot fikri en doğal biçimde ham fikir yakalama ve spec üretme akışına oturuyor.
2. 3D Three.js karakteri bire bir taşımak yerine Expo için 2D animasyonlu maskot tercih edildi; böylece gerçek APK üretimi ve mobil kararlılık korundu.
3. Sesli deneyimi tam speech recognition yerine text + voice transcript modu ile sadeleştirdim; bu, Expo tesliminde izin ve native riskleri azaltıyor.
4. `expo-speech` ile maskotun spec özetini seslendirmesini ekledim; böylece eski konuşan asistan fikri mobilde korunmuş oldu.
5. İnsan desteğini ayrı buton değil, güven mekanizması olarak konumladım; AI düşük güven verdiğinde veya kullanıcı isterse handoff paketi hazırlanıyor.
6. Demo artefaktlarını repo içine koydum; böylece README tek başına değerlendirme için yeterli hale geldi.
7. Release APK'yi yerelde build ederek placeholder yerine gerçek dosya ekledim.

## Validation

- `npx tsc --noEmit`
- `npx expo export --platform web --output-dir dist-web`
- `./gradlew.bat assembleRelease`

