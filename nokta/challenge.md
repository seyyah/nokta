# Nokta Away Mission — Solo Seferi

**Misyon süresi:** 2 saat (10:15 – 12:15)
**Teslim:** Pull Request, bu repoya
**Tavan puan:** 100 + 10 bonus + 3 APK bonus

## Nedir?

`idea.md` dosyasını oku. Nokta fikrinin **bir dilimini** React Native + Expo ile mobile app olarak hayata geçir. Tam fikri değil, bir dilimi.

## Üç Track — birini seç

**Track A — Dot Capture & Enrich**
Ham fikri (text veya ses) alır, AI ile 3-5 engineering soru sorar (problem, user, scope, constraint), tek sayfa spec üretir.

**Track B — Slop Detector / Due Diligence**
Pitch paragrafı yapıştırılır, AI pazar iddialarını test eder, "slop score" + gerekçe üretir.

**Track C — Migration & Dedup**
Not dökümü yapıştırılır (WhatsApp export, bullet listesi), AI dedup eder ve idea card'lara ayırır.

Track seçimi README'ye yaz.

## Teslim formatı

`submissions/<öğrenci-no>-<slug>/` klasörü aç. Örnek: `submissions/20210123-kuantum-seyyah/`

Klasörün içinde zorunlu:
- `README.md` — track seçimi, Expo QR kodu (linki), 60 sn demo video linki, decision log
- idea.md  — seçtiğin track için hazırladığın özelleşmiş fikir dosyan
- `app/` — Expo projesi (veya senin kullandığın framework çıktısı)
- `app-release.apk` — APK dosyası (zorunlu; yoksa ceza)

**Ana dizine (root) dokunma.** Sadece kendi klasörüne commit et. CI ihlal eden PR'ı reject eder.

## Rubric — 100 üzerinden

| Eksen | Puan | Nasıl ölçülür |
|---|---|---|
| Çalışır Teslim | 35 | README'de Expo link + demo video + APK var, app.json geçerli |
| Scope Disiplini | 25 | Track seçimi net + track'in ana akışı eksiksiz |
| Anti-Slop Orijinallik | 20 | Diğer submission'larla cosine similarity < 0.80 |
| Engineering Trace | 20 | ≥5 anlamlı commit, README'de decision log |

**Bonuslar:**
- +10 Çılgınlık (demo gününde manuel) — idea.md'de yazmayan ama Nokta tezine hizmet eden, çalışır ek capability
- +3 APK teknik tamlık bonusu (APK varsa; yoksa -5 ceza)

**Ceza:**
- Similarity ≥ 0.80 → kopyacı submission'a **-%35**. Orijinal belirleme: flag'lenen iki submission'dan **ilk commit** erken olan orijinaldir. İtiraz yok.
- APK yok → **-5**
- Root dosyalara dokunma → PR reject

## Kurallar

- Bireysel. Ekip yok.
- AI tool serbest: a0.dev, Claude Code CLI, Cursor, Copilot. Logla.
- Rate limit vurursan backup tool'a geç, README'de belirt.
