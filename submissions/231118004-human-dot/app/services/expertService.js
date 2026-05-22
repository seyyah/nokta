import { ref, push, onValue, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from './firebaseConfig';

const QUEUE_REF = 'expertQueue';

// ── Öğrenci: Talep Gönder ────────────────────────────────────────────────────

export function submitToExpert(idea, spec, score) {
  const queueRef = ref(db, QUEUE_REF);
  const entry = {
    idea,
    spec,
    score,
    status: 'pending',
    submittedAt: Date.now(),
    expertResponse: null,
    expertName: null,
  };
  return push(queueRef, entry);
}

// ── Öğrenci: Kendi Talebini Gerçek Zamanlı İzle ─────────────────────────────

export function listenToRequest(requestId, callback) {
  const requestRef = ref(db, `${QUEUE_REF}/${requestId}`);
  const unsubscribe = onValue(requestRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: requestId, ...snapshot.val() });
    }
  });
  return unsubscribe; // çağırınca dinlemeyi durdurur
}

// ── Uzman: Tüm Bekleyen Talepleri Gerçek Zamanlı Gör ────────────────────────

export function listenToPendingRequests(callback) {
  const queueRef = ref(db, QUEUE_REF);
  const unsubscribe = onValue(queueRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const requests = [];
    snapshot.forEach((child) => {
      requests.push({ id: child.key, ...child.val() });
    });
    // Yeniden eskiye sırala, sadece pending ve reviewing göster
    const filtered = requests
      .filter((r) => r.status === 'pending' || r.status === 'reviewing')
      .sort((a, b) => b.submittedAt - a.submittedAt);
    callback(filtered);
  });
  return unsubscribe;
}

// ── Uzman: Tüm Talepleri Gör (done dahil) ───────────────────────────────────

export function listenToAllRequests(callback) {
  const queueRef = ref(db, QUEUE_REF);
  const unsubscribe = onValue(queueRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const requests = [];
    snapshot.forEach((child) => {
      requests.push({ id: child.key, ...child.val() });
    });
    callback(requests.sort((a, b) => b.submittedAt - a.submittedAt));
  });
  return unsubscribe;
}

// ── Uzman: Talebi "İnceleniyor" Yap ─────────────────────────────────────────

export function markAsReviewing(requestId, expertName) {
  const requestRef = ref(db, `${QUEUE_REF}/${requestId}`);
  return update(requestRef, { status: 'reviewing', expertName });
}

// ── Uzman: Cevap Gönder ──────────────────────────────────────────────────────

export function sendExpertResponse(requestId, expertName, responseText) {
  const requestRef = ref(db, `${QUEUE_REF}/${requestId}`);
  return update(requestRef, {
    status: 'done',
    expertName,
    expertResponse: responseText,
    respondedAt: Date.now(),
  });
}
