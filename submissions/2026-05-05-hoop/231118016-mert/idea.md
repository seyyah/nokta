# Nokta - Track A: Dot Capture & Enrich Fikri

## Ham Fikir (Raw Idea)
Nokta projesi kapsamında, kullanıcıların aklına gelen anlık yazılım/uygulama fikirlerini (dot) hızlıca sisteme girebilecekleri, daha sonra sistemin Gemini AI yardımıyla bu fikirleri analiz edip eksik parçaları (Kullanıcı kitlesi kim? Teknik sınırlar neler? Çözülen asıl problem ne?) sorarak fikri zenginleştireceği (enrich) bir akış tasarlamak.

## Neden Bu Track?
Çünkü birçok yazılım fikri sadece "şöyle bir uygulama yapsak süper olur" cümlesinden ibaret kalıyor. Fikri bir mühendislik dökümanına (Specification) çevirmek için kritik soruların sorulması ve "Readiness Score" (Hazırbulunuşluk Skoru) ile fikrin ne kadar uygulanabilir olduğunun ölçülmesi gerekiyor. 

## Teknik Akış
1. **Idea Capture:** Kullanıcı fikrini metin olarak girer. (IdeaScreen)
2. **AI Questioning:** Gemini API, girilen metne göre eksik olan "Problem, User, Scope, Constraint" alanlarını belirler ve dinamik sorular üretir. (QuestionsScreen)
3. **Spec Generation:** Kullanıcının cevaplarıyla birleşen fikir, yapılandırılmış tek sayfalık bir "Specification Document" (SpecScreen) haline getirilir.
4. **Scoring:** Fikrin ne kadar detaylandırıldığına göre 0-100 arası bir "Readiness Score" hesaplanır. Eksik alanlar (Missing Fields) dinamik olarak UI'da gösterilir.
