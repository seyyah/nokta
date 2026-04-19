# 🚀 UniMove: Akıllı Kampüs Mikro-Mobilite Platformu
**Teknik Gereksinim Dokümanı (PRD)**

## 1. Problem Tanımı (Engineering Challenge)
Üniversite kampüslerindeki yüksek binalar ("urban canyon") GPS sinyallerinde 10-15 metreye varan sapmalara neden olmaktadır. Ayrıca ders aralarındaki 10 dakikalık sürede binlerce öğrencinin aynı anda sisteme yüklenmesi ("burst load"), standart API yapılarının çökmesine yol açmaktadır.

## 2. Mühendislik Çözümleri
- **Hassas Konumlandırma:** RTK-GNSS modülleri ve bina girişlerine konumlandırılan BLE Beacon ağı ile "Sensor Fusion" yapılarak konum doğruluğu 50cm altına indirilecektir.
- **Yüksek Erişilebilirlik:** Ders aralarındaki anlık yükü (burst load) yönetmek için Redis tabanlı Redlock algoritması ve asenkron Kafka mesaj kuyrukları ile "event-driven" bir mimari kurulacaktır.

## 3. Sistem Kapsamı
- **Filo Yönetimi:** Araçların batarya sağlığı (BMS) telemetrisi anlık olarak izlenecektir.
- **Dinamik Dağıtım:** AI destekli rebalancing algoritmaları ile yoğun talep beklenen fakülte önlerine araç sevkiyatı optimize edilecektir.

## 4. Teknik Kısıtlar ve IoT
- **Enerji Verimliliği:** Araç içi IoT üniteleri NB-IoT protokolünü kullanacaktır.
- **Edge Computing:** Sadece anlamlı delta değişimleri (konum değişikliği, kilit durumu) sunucuya gönderilerek veri paketi boyutu minimize edilecektir.

## 5. Önerilen Teknoloji Yığını (Tech Stack)
| Katman | Teknoloji |
| :--- | :--- |
| **Frontend** | React Native (Expo) |
| **Backend** | Node.js (Microservices) |
| **Database** | PostgreSQL + Redis (Caching) |
| **Message Broker** | Apache Kafka |
| **Cloud** | AWS (Lambda & EC2) |

---
*Bu doküman NOKTA Spec-Agent v3.0 tarafından Gemini 3 Flash Preview modeli kullanılarak üretilmiştir.*