# Decision Log

1. `AuditWidget` root seviyesinde yalnizca bir kez mount edildi; cunku bu widget ekranlar arasi tekrar edilmeden tum host uygulamaya ortak, drop-in bir primitive olarak davranmali.
2. `deps` host uygulama tarafindan enjekte edildi; cunku ekran goruntusu alma, dosya yazma, paylasma ve not saklama gibi native yetenekler widget'in degil host'un sorumluluk sinirinda olmali.
3. Forge girdisi olarak yalnizca gercek widget-uretimli raporlar kabul edildi; cunku manuel yazilmis statik Markdown dosyalari audit akisini ve burn-in kanitini temsil etmez.
4. Resmi track `B` secildi; cunku bu teslimin ana hedefi audit yakalama, rapor disa aktarma ve raporun daha sonra minimal degisikliklerle forge girdisi olarak kullanilmasidir.
5. Track C-ilhamli otonomi kati eklendi; cunku insan dokunus sayaci, rollback kaydi ve golden scenario listesi ajan calismasinin nerede durup insana geri donmesi gerektigini netlestirir.
6. Backend eklenmedi; cunku assignment host sinirinda yerel yakalama ve rapor uretimini istiyor, uzaktaki servisler bu kapsam icin gereksiz karmasiklik olurdu.
7. Statik placeholder raporlar final rapor sayilmadi; cunku audit-reports klasorunde bulunacak gercek dosyalarin uygulama icinden capture, annotation ve export adimlariyla uretilmesi gerekiyor.
