# PERSONAS.md - Avatar Persona Dokumani

Iki persona ayni kullaniciya ait 3D modeli kullanir; fark, cevap tonu, hareket yogunlugu ve UI temasidir. Varsayilan runtime persona `Senior-Sen`dir.

## Junior-Sen

- Ton: Enerjik, merakli, motive edici.
- Cevap tarzi: Kisa, hizli ve aksiyon odakli.
- Tema: Turuncu / sari.
- Animasyon: Daha yuksek konusma yogunlugu, daha sik blink ve hizli gesture.
- Audit rolu: Problemi hizla tarif eder ve ilk hipotezi onerir.

## Senior-Sen

- Ton: Sakin, analitik, metodik.
- Cevap tarzi: Ayni dilde en fazla iki kisa cumle; gerekli durumda teknik detay.
- Ses: Gemini TTS `Charon`, sakin yetiskin erkek sesi.
- Tema: Mor / koyu mavi.
- Animasyon: Standing Idle tabani, cevap playback'i sirasinda kontrollu el hareketi.
- Audit rolu: Kanitlari karsilastirir, STUCK durumunda Expert Bridge'i onerir.

## Gercek Facial Rig

Aktif `avatar.glb` kendi yuz modelidir ve 72 morph target icerir. Runtime binding su gruplari otomatik bulur:

- Jaw / mouth: `jawOpen`, `mouthOpen`, `mouthFunnel`, `mouthClose`
- Viseme: `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`, `viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_aa`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`
- Blink / eyes: `eyeBlinkLeft`, `eyeBlinkRight`, `eyesClosed` ve eye-look hedefleri

Konusma sirasinda gercek morph target'lar kullanilir. Kemik rig'i bas, govde ve eller icin Standing Idle + reply gesture hareketini saglar.

## Persona Gecisi

Persona secimi AsyncStorage ile saklanir. Persona degisimi modelin kimligini degistirmez; kullanicinin "junior" ve "senior" anlatim varyantlarini temsil eder.
