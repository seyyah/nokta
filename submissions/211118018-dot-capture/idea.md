# Idea — Dot Capture (Text-only, Offline)

## Ozet

Bu submission, Nokta vizyonunun **Track A** dilimini mobilde minimum surtunmeyle uygular:

1. Kullanici **ham fikrini** metin olarak girer.
2. Uygulama **engineering-guided** 4 soru ile fikri netlestirir.
3. Sonucta **tek sayfa spec** metni uretilir.

## Problem

Kisa sureli fikir patlamalarinda en buyuk kayip, fikrin **problem-kullanici-scope-constraint** ekseninde netlestirilmeden kalmasidir.

## Cozum

Tek akista kullaniciyi zorunlu sorulara surukleyerek fikri "uretilebilir" bir forma yaklastirmak.

## Hedef kullanici

- Mobil uygulama gelistirme dersi kapsaminda hizli prototip teslimi hedefleyen ogrenci
- Kendi fikrini 10 dakikada netlestirmek isteyen bireysel gelistirici

## MVP scope (ne var)

- Ham fikir text alani
- 4 engineering sorusu
- Soru bazli secilebilir oneri chipleri (hizli doldurma)
- Tek sayfa spec ciktisi

## Non-goals (ne yok)

- Ses kaydi / STT
- Harici LLM API cagrilari
- Sosyal medya scraping, dedup, marketplace

## Engineering sorulari (sabit set)

1. Problem nedir?
2. Hedef kullanici kim?
3. MVP scope (ne var)?
4. Constraint (zaman/teknik/butce)?

## Cikti formati (one-page spec)

Asagidaki basliklar sabittir:

- Problem Statement
- Target User
- MVP Scope
- Constraints
- Success Metrics (2 madde)

## Neden offline deterministic?

Teslim guvenilirligi ve kontrol edilebilirlik icin uygulama davranisi **tamamen yerel** tutulmustur. Bu yaklasim, demo sirasinda ag/API bagimliligini ortadan kaldirarak dusuk riskli teslim saglar.
