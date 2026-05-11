# Nokta Mascot Idea

## Problem

Nokta gibi bir AI asistan yalnizca metin kutusu olarak kaldiginda kullanici ile duygusal ve sezgisel bir bag kurmakta zayif kalir. Ozellikle mobilde sesli kullanim, hizli fikir yakalama ve karakter tepkileri kullanicinin daha dogal bir sekilde fikir anlatmasini saglar.

## Cozum

Nokta Mascot, Nokta'yi mobil uyumlu 3D bir karaktere donusturur. Kullanici konusarak veya yazarak fikrini aktarir. Sistem sesi Web Speech API ile metne cevirir, Groq Llama 3 ile kisa bir asistan cevabi uretir, cevabi sesli okur ve avatar bu sirada dudak senkronu yapar.

## Hedef Kullanici

- Fikrini hizlica sesli anlatmak isteyen ogrenciler.
- Nokta'yi daha canli ve karakterli bir AI asistan olarak kullanmak isteyen mobil kullanicilar.
- AI cevabinin yalnizca metin degil, sesli ve gorsel geri bildirimle verilmesini isteyen kullanicilar.

## Temel Akis

1. Kullanici uygulamayi mobil veya masaustu tarayicida acar.
2. Nokta avatar bekleme modunda gorunur.
3. Kullanici mikrofon butonuna basip fikrini soyler.
4. SpeechRecognition metni cikarir.
5. Groq Llama 3 Nokta karakterinde kisa bir cevap uretir.
6. SpeechSynthesis cevabi okur.
7. Avatar ses seviyesine gore dudak hareketi yapar.
8. Kullanici avatarla tiklama veya okşama hareketleriyle etkilesime girer.

## Teknik Kapsam

- React + Vite uygulamasi.
- `@react-three/fiber` tabanli 3D canvas.
- `@react-three/drei` ile ortam isigi ve yardimci 3D bilesenler.
- `three` ile avatar geometrileri ve animasyon mantigi.
- Web Speech API ile ses tanima ve ses sentezleme.
- Groq SDK ile Llama 3 sohbet modeli.
- `@vitejs/plugin-basic-ssl` ile yerel HTTPS.

## Riskler ve Sinirlar

- Web Speech API tarayiciya bagimlidir; iOS tarafinda Safari daha guvenilir calisir.
- Groq API anahtari tarayici tarafinda kullanildigi icin gercek urunde backend proxy tercih edilmelidir.
- APK uretilmedi; bu teslim web prototipi olarak tasarlandi.
- Mikrofon izni icin HTTPS gerekir.

## Basari Kriterleri

- Uygulama `npm run build` ile derlenebilmeli.
- Mobil ekranda avatar ve floating mikrofon arayuzu bozulmadan gorunmeli.
- Kullanici metinle ve desteklenen tarayicilarda sesle soru sorabilmeli.
- Avatar idle, sleep, angry, love ve talking durumlarini gosterebilmeli.
