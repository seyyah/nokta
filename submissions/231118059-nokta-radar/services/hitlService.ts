/**
 * hitlService.ts
 * Human-in-the-Loop kuyruğunu AsyncStorage ile yönetir.
 * Admin soruları cevaplar → knowledgeService'e yazar → ChatScreen polling ile yakalar.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveKnowledgeEntry } from './knowledgeService';

const HITL_QUEUE_KEY = '@nokta_hitl_queue';

export type HitlStatus = 'pending' | 'answered';

export interface HitlItem {
  id: string;           // Benzersiz ID
  chatId: string;       // Hangi chat'te soruldu (mesaj ID'si)
  question: string;     // Kullanıcının sorusu
  context?: string;     // Sorunun bağlamı (önceki mesajlar özeti)
  status: HitlStatus;
  answer?: string;      // Admin'in cevabı
  topic?: string;       // Admin'in atadığı konu başlığı
  createdAt: string;    // ISO timestamp
  answeredAt?: string;  // Cevaplandığında
}

/** Tüm HITL kuyruğunu AsyncStorage'dan okur */
async function readQueue(): Promise<HitlItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HITL_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Kuyruğu AsyncStorage'a yazar */
async function writeQueue(queue: HitlItem[]): Promise<void> {
  await AsyncStorage.setItem(HITL_QUEUE_KEY, JSON.stringify(queue));
}

/** Yeni bir soruyu HITL kuyruğuna ekler */
export async function addToQueue(
  chatId: string,
  question: string,
  context?: string
): Promise<HitlItem> {
  const queue = await readQueue();
  const item: HitlItem = {
    id: `hitl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    chatId,
    question,
    context,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  queue.push(item);
  await writeQueue(queue);
  return item;
}

/** Bekleyen (pending) soruları döner — Admin paneli için */
export async function getPendingQuestions(): Promise<HitlItem[]> {
  const queue = await readQueue();
  return queue.filter(item => item.status === 'pending');
}

/** Tüm soruları döner (pending + answered) */
export async function getAllQuestions(): Promise<HitlItem[]> {
  return readQueue();
}

/**
 * Admin bir soruyu cevaplar:
 * 1. AsyncStorage'da 'answered' olarak işaretler
 * 2. knowledgeService'e yazar → .md dosyası oluşur
 */
export async function answerQuestion(
  id: string,
  answer: string,
  topic: string
): Promise<HitlItem | null> {
  const queue = await readQueue();
  const idx = queue.findIndex(item => item.id === id);
  if (idx === -1) return null;

  queue[idx].status = 'answered';
  queue[idx].answer = answer;
  queue[idx].topic = topic;
  queue[idx].answeredAt = new Date().toISOString();

  await writeQueue(queue);

  // Knowledge base'e kaydet
  await saveKnowledgeEntry({
    question: queue[idx].question,
    answer,
    topic,
    date: new Date().toISOString().split('T')[0],
  });

  return queue[idx];
}

/**
 * Chat ekranı için polling: belirli bir chatId'ye ait
 * cevaplanmış HITL item'ını döner (varsa)
 */
export async function getAnswerForChatId(chatId: string): Promise<HitlItem | null> {
  const queue = await readQueue();
  const item = queue.find(
    i => i.chatId === chatId && i.status === 'answered'
  );
  return item || null;
}

/** Belirli bir item'ın son durumunu döner */
export async function getItemById(id: string): Promise<HitlItem | null> {
  const queue = await readQueue();
  return queue.find(i => i.id === id) || null;
}

/** Tüm kuyruğu temizler (admin debug için) */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(HITL_QUEUE_KEY);
}
