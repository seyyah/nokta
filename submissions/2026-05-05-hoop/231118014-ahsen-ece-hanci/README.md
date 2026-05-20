# Nokta — Slop Detector + Uzman Desteği (Track B)

Yatırımcı gözüyle pitch analizi. Bir pitch paragrafını yapıştır, AI onu otopsi masasına yatırsın — gerektiğinde gerçek bir **uzmana** eskalasyon yap.

## Track Seçimi

**Track B — Slop Detector / Due Diligence + Uzman Desteği (HITL)**

Pitch paragrafı yapıştırılır → AI, yatırımcı perspektifiyle çok boyutlu analiz eder → büyük bir **Slop Score (0–100)** + 5 boyutlu kırılım + kırmızı bayraklar + doğrulanması gereken iddialar + grounded rewrite döner. AI'ın yetersiz kaldığı veya kullanıcının ikinci bir göz istediği durumlarda **"Uzmana Yönlendir"** seçeneğiyle pitch bir insana eskalasyon edilebilir.

## Demo

- 🎥 **60 sn Demo Video (Uzman Desteği):** https://youtube.com/shorts/cmU881lLbzw
- 🎥 60 sn Demo Video (Slop Detector temel akış): https://www.youtube.com/shorts/KkkGSpYeERU
- 📱 **Expo / Rork Preview Link:** https://rork.app/?exp=p_8v05r484abccw5w3g0lqv--expo.rork.live&p=8v05r484abccw5w3g0lqv&app=false

Linki telefonda aç → Rork / Expo Go ile uygulamayı doğrudan çalıştırabilirsin.

## Ana Akış

1. **Dissection Chamber** — Mono textarea'ya pitch yapıştır, "RUN AUTOPSY" bas.
2. **Running Diagnostics** — Terminal-style canlı log akışı, skor sayacı animasyonu.
3. **Slop Score & Boyutlar** — 0–100 arası skor, 5 boyutta kırılım (claim density, evidence, specificity, novelty, feasibility), kırmızı bayraklar ve grounded rewrite önerisi.
4. **Uzman Desteği (Yeni)** — Sonuç ekranında **"Uzmana Yönlendir"** butonuyla pitch uzman havuzuna düşer. Uzman değerlendirmesini tamamlayıp sonucu kullanıcıya geri döner.

## Uzman Desteği — Detay

| Konsept         | Açıklama                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Model**       | HITL (Human-In-The-Loop) — `hop-imdat` ve `nokta-hoop` repolarındaki HOTL konseptine dayanır |
| **Tetikleyici** | Düşük AI güven skoru **veya** kullanıcı manuel eskalasyonu                                   |
| **Akış**        | Pitch + AI ön analiz → uzman kuyruğu → uzman cevabı → kullanıcıya dönüş                      |
| **UI**          | Sonuç ekranında "Uzmana Yönlendir" butonu + bekleyen istek durumu                            |

## Scope Dışı Bırakılanlar (bilinçli)

- Track A (Dot Capture) ve Track C (Migration) — fokus dağılmasın.
- Kullanıcı hesabı / cloud sync — scope dışı, gizlilik için de gereksiz.
- Push notifications, paywall — Track B akışıyla ilgisiz.
- Uzman tarafında gerçek bir backend kuyruk sistemi — bu iterasyonda UI/akış simülasyonu seviyesinde tutuldu.

## Decision Log

1. **Track B seçildi** — Slop Detector akışı, AI'ın güçlü olduğu metin analizine en uygun track.
2. **Mono terminal UI** — Yatırımcı / due diligence havası için bilinçli estetik tercihi.
3. **Tek skor + boyut kırılımı** — Sayısal bir kararı tek bakışta okunur kılmak için.
4. **Grounded rewrite önerisi** — Sadece kritik etmek değil, somut iyileştirme yolu sunmak.
5. **Uzman desteği eklendi (Yeni)** — AI tek başına yetersiz kaldığında akışın kırılmaması için HITL katmanı.
6. **Eskalasyon butonu kullanıcı kontrolünde** — Otomatik değil manuel: kullanıcının ne zaman insan istediğine kendisi karar versin.
7. **APK + Expo link birlikte** — Hem hızlı önizleme hem offline kurulum desteği.
8. **Rork ile geliştirildi** — Hızlı iterasyon ve Expo SDK 54 uyumluluğu için.
9. **Decision log + AI tool log şeffaflığı** — Rubrikteki dürüstlük gereği AI kullanımı açıkça raporlandı.
10. **Uzman desteği için yeni demo video** — Mevcut Slop Detector demosunun üstüne sadece yeni özelliği gösteren ek bir 60 sn video çekildi.

## Kurulum (lokal geliştirme)

```bash
bun install
bun run start
```

QR kodu tara → Expo Go / Rork app ile aç.

## AI Tool Log

- **Rork** — Mobile app builder (Expo SDK 54 tabanlı)
- **Claude** — Planlama, decision log, README hazırlığı
