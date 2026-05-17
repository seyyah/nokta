# EVAL: Otonomi Altın Senaryoları (Ratchet)

Bu dosya, agent'ın (otonom kodlama botunun) zaman içinde öğrendiği "altın senaryoları" ve edindiği deneyimleri tutar. Başarılı geçen her bir kritik "Forge Cycle", gelecekteki onarımların daha kararlı ve hatasız olmasını sağlamak için bu listeye bir referans (Ratchet) olarak eklenmiştir.

## Senaryo 1: Dinamik Route (Reaktivite) Hatası
- **Sorun:** (Cycle 7) AuditWidget `currentScreen` prop'u, bileşen ilk mount edildiğinde alınıp sabit kalıyordu (Reaktif değildi).
- **Altın Kural:** Uygulama içinde yer alan herhangi bir "Drop-in" widget'a aktif sayfayı geçirirken, React Router veya benzeri yönlendirme kütüphanelerinin (örn: `useLocation`) tetiklediği reaktif state'ler kullanılmalıdır. Sabit değişkenlerden kaçınılmalıdır. Bu kural ileride eklenecek diğer widget'lar için de geçerlidir.

## Senaryo 2: Depolama Kotası Yönetimi (Self-Healing)
- **Sorun:** (Cycle 18-19) Widget, base64 formatındaki ekran görüntülerini `localStorage`'a kaydederken 5MB kotasını aştı ve `QuotaExceededError` fırlattı.
- **Altın Kural:** Tarayıcı tarafında büyük veriler (Base64 resimler vb.) depolanırken mutlaka `try-catch` blokları içinde işlem yapılmalı ve "capped storage" (örneğin sadece son 5 kaydı tutma) mantığı uygulanmalıdır. Yeni eklenecek hiçbir özellik uygulamanın çökmesine (White Screen of Death) sebep olmamalıdır.

## Senaryo 3: Güvenli Referans Silinmesi (Deep Clean)
- **Sorun:** (Cycle 22-24) Sayfadan büyük bir bileşen (3D Asistan) silindiğinde, onu kullanan alt bileşenlerdeki `import` referansları da beraberinde bozuldu (`ArrowLeft is not defined` hatası).
- **Altın Kural:** Koddan bir görsel bileşen çıkarıldığında, o bileşenin bağımlı olduğu ikonlar ve "utility" fonksiyonları da (Eğer başka bir yerde kullanılmıyorsa) temizlenmelidir. Refactor işlemleri "Nuclear" (Büyük çaplı ve riskli) olduğunda, kod test edilmeden kaydedilmemelidir.
