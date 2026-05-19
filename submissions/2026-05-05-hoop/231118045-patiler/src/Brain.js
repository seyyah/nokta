import Voice from "./Voice";

class NoktaBrain {
  constructor() {
    this.history = [];
  }

  async sendMessage(message, onSpeechEnd = null, onExpertReply = null) {
    // 1 saniyelik sahte düşünme süresi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let text = "";
    const lowerMsg = message.toLowerCase();

    // Sadece evcil hayvanlara özel cevaplar
    if (lowerMsg.includes("hasta") || lowerMsg.includes("kötü") || lowerMsg.includes("sorun") || lowerMsg.includes("topall") || lowerMsg.includes("yemiyor")) {
      text = "Eyvah, patili dostumuzun bu durumu beni çok endişelendirdi! Ben sadece bir asistanım, bunu hemen Gerçek Veteriner Kahramanlarımıza sormamız lazım. Durumu onlara iletiyorum!";
    } else if (lowerMsg.includes("oyun") || lowerMsg.includes("mutlu") || lowerMsg.includes("koş") || lowerMsg.includes("tatlı")) {
      text = "Ne kadar tatlı! Tüylü dostlarımız bazen enerjilerini atamayınca böyle yaramazlıklar yapabiliyor. Belki de sadece seninle oyun oynamak istiyordur?";
    } else {
      text = "Patiler dünyasına hoş geldin! Evcil hayvanının neye ihtiyacı var, bana her şeyi anlatabilirsin.";
    }

    this.history.push({ role: "user", content: message });
    this.history.push({ role: "assistant", content: text });

    Voice.speak(text, onSpeechEnd);

    // Uzman Simülasyonu: Eğer durum ciddiyse 4 saniye sonra uzman cevap versin
    if (text.includes("iletiyorum!")) {
      setTimeout(() => {
        const expertText = "Veteriner Zeynep: Merhaba! Durumu Pati'den yeni aldım. Lütfen panik yapmayın. Eğer başka ciddi bir belirti yoksa sadece yorgun olabilir. Sıcak ve sessiz bir yerde dinlenmesini sağlayın. Yarına kadar geçmezse kliniğe getirebilirsiniz.";
        this.history.push({ role: "assistant", content: expertText });
        Voice.speak(expertText, null, true); // true = kadın sesi
        if (onExpertReply) onExpertReply(expertText);
      }, 4000);
    }

    return text;
  }
}

export default new NoktaBrain();
