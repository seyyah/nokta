/**
 * Rate Limiter — Debounce + Exponential Backoff + Request Queue
 * 
 * Google Sheets API kotaları:
 *   - 60 req/dk kullanıcı başına
 *   - 300 req/dk proje başına
 * 
 * Bu modül, isteklerin kotayı aşmamasını sağlar.
 */

/**
 * Debounce fonksiyonu.
 * Kullanıcı yazmayı bitirene kadar bekler, sonra tek bir istek atar.
 * 
 * @param {Function} fn - Çağrılacak fonksiyon
 * @param {number} delayMs - Bekleme süresi (ms)
 * @returns {Function} - Debounced fonksiyon (cancel metodu ile)
 */
export function createDebounce(fn, delayMs = 2000) {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debounced.flush = (...args) => {
    debounced.cancel();
    fn(...args);
  };

  return debounced;
}

/**
 * Exponential Backoff ile fetch.
 * 429 (Too Many Requests) hatası gelirse otomatik olarak bekleyip tekrar dener.
 * 
 * @param {Function} fetchFn - Çağrılacak async fonksiyon
 * @param {number} maxRetries - Maksimum deneme sayısı
 * @returns {Promise<any>} - Fonksiyon sonucu
 */
export async function fetchWithBackoff(fetchFn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.status === 429;
      const is503 = err.message?.includes('503') || err.status === 503;

      if ((is429 || is503) && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Rate limited (attempt ${attempt + 1}/${maxRetries}), waiting ${Math.round(waitMs)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Polling manager.
 * Belirli aralıklarla bir fonksiyonu çağırır, önceki çağrı bitmeden yenisini başlatmaz.
 * 
 * @param {Function} pollFn - Çağrılacak async fonksiyon
 * @param {number} intervalMs - Polling aralığı (ms)
 * @returns {{ start: Function, stop: Function }}
 */
export function createPoller(pollFn, intervalMs = 10000) {
  let intervalId = null;
  let isPolling = false;

  const poll = async () => {
    if (isPolling) return; // Önceki çağrı hâlâ devam ediyorsa atla
    isPolling = true;
    try {
      await pollFn();
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      isPolling = false;
    }
  };

  return {
    start: () => {
      if (intervalId) return; // Zaten çalışıyor
      poll(); // İlk çağrıyı hemen yap
      intervalId = setInterval(poll, intervalMs);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
