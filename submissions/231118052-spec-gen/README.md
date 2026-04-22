# NOKTA - AI Powered Spec Generator 🚀

**Öğrenci No:** 231118052
**İsim:** Mert Kayar
**Seçilen Track:** Track 1 (Spec Generator)

## 🎥 Demo ve Bağlantılar
- **60 Saniyelik Demo Videosu:** [[Demo Video](https://youtube.com/shorts/UCKWTmgkmtI?feature=share)]
- **Expo Proje Linki:** [EAS Dashboard](https://expo.dev/accounts/mertkayar/projects/app)

## 🧠 Decision Log (Karar Günlüğü)
Bu projeyi geliştirirken aldığım temel teknik kararlar ve karşılaştığım zorlukların çözümleri:

1. **Mimari ve UI Akışı:** Expo'nun varsayılan 'Tabs' (sekmeli) yapısını projeden tamamen temizleyerek `_layout.tsx` üzerinden tek sayfalık (`index.tsx`) bir akış kurdum. UI, 3 aşamalı bir State mimarisiyle (Fikir -> Sorular -> Final Spec) tasarlandı.
2. **Yapay Zeka Entegrasyonu:** Google Gemini API entegrasyonu sağlandı. React Native ortamında oluşan fetching hatalarını çözmek için `react-native-url-polyfill` yaması kullanıldı. 
3. **Rate Limit Stratejisi:** Geliştirme sürecinde API'nin (429 - Quota Exceeded) sınırlarına takılmamak ve uygulamanın UI/UX akışını kesintisiz sunabilmek amacıyla, final derlemesinde "Mock Data" (Sahte Veri) mimarisine geçiş yapıldı.
4. **Derleme (Build):** Varsayılan `.aab` çıktısı yerine doğrudan hocanın talep ettiği kurulum dosyasını üretebilmek için `eas.json` dosyası yapılandırılarak bulut üzerinden `.apk` (`app-release.apk`) derlemesi gerçekleştirildi.