# IDEA.md - Musterinin gelistirici oldugu SlopDetec akisi

SlopDetec'in Track B fikri, pitch degerlendiren kisinin yalnizca "bu fikir kotu" demesini degil, ekranda hangi karar noktasinin gelistirici tarafinda is uretmesi gerektigini isaretlemesini saglar. Ornegin kullanici Results ekraninda uzman onayi bolgesini isaretleyip "bu sadece mailto degil, neden insan onayi gerekiyor bilgisini de gostermeli" dediginde bu artik klasik bug raporu degil, gorsel kanitli bir feature request olur. Agent raporu okur, ekrandaki baglami gorur ve feature niyetini `FORGE.md` ledger'ina tasir.

Bu kompozisyonda audit widget bir hata yakalama araci olmaktan cikarak musteri-gelistirici arayuzune donusur. Musteri kod yazmaz, issue sablonu doldurmaz, backlog diliyle dusunmez; sadece urunun ustunde durup "burada su davranis lazim" der. SlopDetec tarafinda bu ozellikle degerli cunku due diligence araclarinda kararlar gri alandadir: bazen AI skoru yeterlidir, bazen insan onayi gerekir, bazen pitch daha dar bir MVP'ye indirgenmelidir. Audit raporu bu gri bolgeyi agent icin islenebilir bir artifact'a cevirir.

Uygulamadaki sol `Audit -> Sec` karari da bu fikrin parcasidir. Secim her dokunusta baslamaz; kullanici once audit moduna girer, sonra tek bir bolgeyi secip not alir. Boylece musteri yakalama ani ile agent onarim ani arasinda temiz, kontrollu ve tekrar edilebilir bir halka kurulur.
