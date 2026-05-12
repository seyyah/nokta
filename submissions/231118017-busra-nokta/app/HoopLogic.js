// @ts-nocheck
import { useState, useCallback } from 'react';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HoopLogic: Mirror Modu & HITL Simülasyonu
 * Bu hook, Expo içinde yerel WebRTC desteklenmediği için bu
 * çağrı akışını simüle eder ve uygulamanın çalışmasını sağlar.
 */
export const useHoopCall = ({ callId }) => {
  const [status, setStatus] = useState('idle'); // idle, joining, joined, completed, error
  const [transcript, setTranscript] = useState('');

  const joinCall = useCallback(async () => {
    if (!callId) {
      console.error('Call ID eksik!');
      setStatus('error');
      return;
    }

    try {
      setStatus('joining');
      await delay(1200);
      setStatus('joined');

      setTranscript(
        '### 🧠 Mentor Teknik Analizi (Mirror Session)\n' +
        '* **Güvenlik Riski:** Kredi kartı verilerinin açık metin saklanması kritik bir hata. Veritabanı seviyesinde şifreleme ve KVKK uyumu şart.\n' +
        '* **Ölçeklenebilirlik:** Saniyede 1 milyon işlem yükü için yatay ölçekleme (horizontal scaling) ve Kafka gibi bir mesaj kuyruğu yapısı incelenmeli.\n' +
        '* **Sonuç:** Proje teknik olarak iddialı ancak güvenlik katmanları yeniden kurgulanmalı.'
      );
    } catch (error) {
      console.error('Stream bağlantı hatası:', error);
      setStatus('error');
    }
  }, [callId]);

  // Görüşmeden ayrılma ve durumu tamamlama fonksiyonu
  const leaveCall = useCallback(async () => {
    await delay(400);
    setStatus('completed');
  }, []);

  return {
    joinCall,
    leaveCall,
    transcript,
    status
  };
};