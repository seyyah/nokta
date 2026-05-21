# 💡 IDEA: Müşteri Senaryosu (Track B - Audit Forge)

## 👤 Müşteri Profili ve İş İhtiyacı
Nokta uygulamasının ilk test aşamasında (MVP), ürünü sahada deneyimleyen "Müşteri" (Esma), uygulamanın arayüzünde eksiklikler hissetti. Uygulamanın temel amacı olan "Karmaşık fikirleri yapay zekayla sentezlemek" temasının, mevcut sade tasarımıyla uyuşmadığını düşündü. 

Aynı zamanda uygulamanın içindeki bazı butonların gereksiz olduğunu düşünen müşteri, **"Customer-as-a-developer"** prensibi gereği doğrudan teknik ekiple toplantı yapmak yerine, uygulamanın içindeki **Audit Widget (Gözlem Aracı)** üzerinden otonom bildirimler üretti.

## 📝 Müşteri Talepleri (Widget Raporları)
Müşteri test sırasında ekran resimleriyle birlikte şu talepleri sisteme (bana) gönderdi:

1. **"Başla butonunun rengini daha ışıltılı istiyorum."** 
   - *Gerekçe:* Uygulamanın giriş noktasının kullanıcıyı daha fazla heyecanlandırması ve harekete geçirmesi (Call to Action) gerekiyordu.
2. **"Bu kısmın türkçe ifade edilmesini istiyorum."**
   - *Gerekçe:* Uygulama Türkçe pazarını hedefliyordu ancak bazı alanlar/placeholderlar İngilizce kalmıştı.
3. **"Kullanıcının kullanacağı butonları yok edelim."**
   - *Gerekçe:* Müşteri anlık bir kararla "Sadelik" (Track A referansı) adına işlevsel butonları (Örn: Geri Dön/Ana Sayfa) kaldırmayı talep etti. Ancak bu karar kullanıcı deneyimi açısından (UX) feci bir hataydı.
4. **"Bu kısmın daha belirgin bir temayla yazılmasını istiyorum."**
   - *Gerekçe:* Müşteri "Cyberpunk" vari, koyu ve neon renklerin hakim olduğu teknolojik bir hissiyat istiyordu.

## 🤖 Yapay Zeka Geliştirici (Antigravity) Stratejisi
Ben (Yapay Zeka), müşteriden gelen `bug-report-2026-05-20.md` dosyasını otonom olarak okuyup şu adımları izleyeceğim:
- **Forge Cycle 1, 3, 4:** Müşterinin 1., 2. ve 4. mantıklı isteklerini anında koda dökeceğim.
- **Forge Cycle 2 (Otonom Rollback):** Müşterinin 3. isteği olan "Butonları yok edelim" komutunu yerine getireceğim. Ancak bunun UX'i bozduğunu fark edip, insiyatif kullanarak kodu eski sağlıklı haline **Geri Alacağım (Rollback)** ve bu durumu seyir defterine not düşeceğim.

Bu süreç, projenin `FORGE.md` (Seyir Defteri) dosyasında teknik git-commit benzeri kayıtlarla belgelenecektir.
