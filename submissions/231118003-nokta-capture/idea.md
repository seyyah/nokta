# Nokta Capture: Track A — Dot Capture & Enrich

## 1. Fikir Özeti (Idea Summary)
Nokta Capture, bir fikrin en ham halini ("nokta") yakalayıp, mühendislik disiplini ile zenginleştirerek ("enrich") somut bir ürün spesifikasyonuna dönüştüren mobil kuluçka aracıdır. Bu uygulama, fikirlerin Notion sayfalarında veya WhatsApp mesajlarında kaybolmasını engeller; onları AI rehberliğinde sorgulayarak ayakları yere basan projelere dönüştürür.

## 2. Track A Stratejisi
Bu uygulama Nokta ekosisteminin "Giriş" (Ingestion) katmanıdır. 
- **Capture:** Kullanıcı aklına gelen fikri tek bir cümleyle sisteme girer.
- **Enrich:** Sistem, "slop" (gereksiz yığın) üretmek yerine kullanıcıyı 5 kritik mühendislik sorusuyla zorlar:
    1. **Problem:** Bu fikir kimi, neden rahatsız eden bir sorunu çözüyor?
    2. **User:** Hedef kitle kim?
    3. **Scope:** İlk versiyonun sınırları nedir?
    4. **Constraint:** Hangi kısıtlar (teknik, yasal, bütçe) var?
    5. **Success Metric:** Başarıyı nasıl ölçeceğiz?
- **Artifact:** AI, bu cevapları sentezleyerek profesyonel bir "Product Spec" üretir.

## 3. Neden Bu Yaklaşım?
AI çağında fikir üretmek ucuzladı, ancak fikri *doğrulamak* ve *sınırlarını çizmek* zorlaştı. Nokta Capture, "engineering-guided" akışıyla kullanıcıyı bir mühendis gibi düşünmeye zorlar. Üretilen spec, projenin "anayasası" niteliğindedir ve doğrudan geliştirme aşamasına (NAIM Loop) aktarılabilir.

## 4. Teknik Detaylar
- **Frontend:** React Native + Expo (Premium Soft UI Design)
- **AI Engine:** Google Gemini 2.0 Flash
- **Storage:** Local AsyncStorage (Gizlilik odaklı)
- **Export:** Markdown formatında paylaşım desteği.

---
*Bu dosya, 231118003 numaralı öğrencinin Nokta projesi Track A ödevi için hazırlanmıştır.*
