> **Language / Dil:** [English](#note-point--track-a-dot-capture--enrich) | [Türkçe](#notepoint--track-a-dot-capture--enrich-1)

# NotePoint — Track A: Dot Capture & Enrich

---

## 🚀 Track Selection
**Track A: Capture & Enrich** NotePoint focuses on the "Dot Capture" and "Enrich" stages of the engineering workflow. It uses a reasoning-engine approach to transform raw, messy notes into structured, high-density project cards (Problem, User, Scope, and Constraints).

---

## 🎥 Demo Video (60 Seconds)
**Link:** [https://www.youtube.com/shorts/Y1Vc8nbQR18](https://www.youtube.com/shorts/Y1Vc8nbQR18)

---

## 📱 Expo QR Code & Link
**EAS Build Dashboard:** [https://expo.dev/accounts/tirsit/projects/notepoint/builds/18a12a50-b17e-41a0-9600-20cf0cb60a15](https://expo.dev/accounts/tirsit/projects/notepoint/builds/18a12a50-b17e-41a0-9600-20cf0cb60a15)

> The physical **app-release.apk** is included in this directory at:  
> `submissions/9221118085-notepoint/app-release.apk`

---

## 📝 Decision Log

| Date | Decision | Reason |
| :--- | :--- | :--- |
| 2026-04-21 | **Gemini 2.5 Flash-Lite** | Switched from 1.5 to 2.5 Flash-Lite to ensure sub-2-second latency for the "Enrich" phase while maintaining high JSON schema accuracy. |
| 2026-04-21 | **Dependency Pinning** | Manually locked React to **18.2.0** and Expo to **51.0.0** to resolve peer-dependency conflicts with React 19 in the EAS cloud environment. |
| 2026-04-21 | **EAS APK Profile** | Configured a dedicated `preview` profile in `eas.json` with `"buildType": "apk"` to satisfy the mandatory installable file requirement. |
| 2026-04-21 | **Asset Configuration** | Sanitized `app.json` by removing missing icon/splash paths, preventing ENOENT errors during the automated prebuild process. |
| 2026-04-21 | **Reasoning Engine Loop** | Implemented multi-turn prompting to build project context iteratively, mirroring Karpathy's philosophy of using LLMs for reasoning rather than single-shot generation. |

---

## 📂 Project Navigation
- **[idea.md](./idea.md)**: Full project specification, user flow, and design philosophy.
- **app/**: Source code for the NotePoint application.
- **app-release.apk**: Compiled Android application file.

# NotePoint — Track A: Dot Capture & Enrich

---

## 🚀 Track Seçimi
**Track A: Capture & Enrich** NotePoint, yapılandırılmamış ham notları yakalamaya ve bir yapay zeka "akıl yürütme döngüsü" (Reasoning Loop) kullanarak bunları yapılandırılmış mühendislik kavramlarına (Problem, Kullanıcı, Kapsam ve Kısıtlamalar) dönüştürmeye odaklanır.

---

## 🎥 Demo Video (60 Saniye)
**Link:** [https://www.youtube.com/shorts/Y1Vc8nbQR18](https://www.youtube.com/shorts/Y1Vc8nbQR18)

---

## 📱 Expo QR Kodu ve Bağlantı
**EAS Build Paneli:** [https://expo.dev/accounts/tirsit/projects/notepoint/builds/18a12a50-b17e-41a0-9600-20cf0cb60a15](https://expo.dev/accounts/tirsit/projects/notepoint/builds/18a12a50-b17e-41a0-9600-20cf0cb60a15)

> Fiziksel APK dosyası (**app-release.apk**) bu teslim dizininde yer almaktadır:  
> `submissions/9221118085-notepoint/app-release.apk`

---

## 📝 Karar Günlüğü

| Tarih | Karar | Sebep |
| :--- | :--- | :--- |
| 21.04.2026 | **Gemini 2.5 Flash-Lite** | Düşük gecikme süresi (2 saniye altı) ve yüksek JSON şema doğruluğu için tercih edildi. |
| 21.04.2026 | **Bağımlılık Sabitleme** | React 18.2 ve Expo 51 versiyonları, EAS bulut ortamındaki React 19 çakışmalarını çözmek için sabitlendi. |
| 21.04.2026 | **EAS APK Profili** | Zorunlu APK teslimi için `eas.json` dosyasına özel bir build profili (`apk` buildType) eklendi. |
| 21.04.2026 | **Çok Adımlı İstemi (Prompting)** | Karpathy'nin felsefesine uygun olarak, bağlamın iteratif olarak oluşturulması ve halüsinasyonların azaltılması sağlandı. |

---

## 📂 Proje İçeriği
- **[idea.md](./idea.md)**: Detaylı proje spesifikasyonları ve tasarım felsefesi.
- **app/**: Uygulamanın tüm kaynak kodları.
- **app-release.apk**: uygulamanın yüklenebilir Android dosyası.