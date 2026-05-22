# PERSONAS.md - SlopDetec Avatar Variants

Track ana secimi: C  
Ek destek: 2 avatar/persona varyanti

## Junior-sen

- Ton: hizli, daha direkt, kullaniciya once neresi canli neresi fazla slop onu soyler.
- Sahne: mavi/cyan halka, daha parlak feedback enerjisi.
- Rapor okuma: daha hizli rate ve daha yuksek pitch.
- Kullanim: demo sirasinda hizli feedback veya ilk audit raporu okuma.

## Senior-sen

- Ton: daha sakin, daha kararli, once risk sonra tek onarim hipotezi verir.
- Sahne: altin halka ve daha sicak isik; Junior'dan ayirt edilebilir.
- Rapor okuma: daha yavas rate ve daha dusuk pitch.
- Kullanim: rollback/fail sonrasi daha ciddi forge degerlendirmesi.

## Avatar asset karari

Uygulama `app/assets/avatar.glb` dosyasini yukler. Web demosunda Avatar ekranindaki `GLB yukle` butonu ile kullanici kendi Avaturn export'unu anlik olarak secebilir. Teslim icin dogru yol, kendi yuzunden uretilmis Avaturn `.glb` dosyasini hem kokteki `avatar.glb` hem `app/assets/avatar.glb` olarak koymaktir.

## Lipsync

Mikrofon seviyesi ve rapor okuma modu ayni `level` degerini avatar agzina baglar. GLB icinde `jawOpen`, `mouthOpen`, `viseme_aa`, `viseme_A`, `viseme_O` veya `mouthFunnel` morph target varsa onlar oynatilir. Bu kanallar yoksa gorsel demo bos kalmasin diye sahnede mouth overlay fallback calisir.
