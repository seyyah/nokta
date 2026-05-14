import { Question } from '../types';

// 5 adet engineering sorusu — Track A için sabit sorular
export const ENGINEERING_QUESTIONS: Question[] = [
  {
    id: 'q1',
    key: 'problem',
    step: 1,
    title: '🎯 Problem Nedir?',
    subtitle:
      'Bu fikir hangi somut problemi çözüyor? Şu an insanlar bu sorunu nasıl aşıyor?',
    placeholder:
      'Örn: İnsanlar alışveriş listelerini unutuyor çünkü telefonda çok fazla uygulama var ve hiçbirini düzenli kullanmıyor...',
    icon: '🎯',
    color: '#6C63FF',
  },
  {
    id: 'q2',
    key: 'targetUser',
    step: 2,
    title: '👤 Hedef Kullanıcı Kim?',
    subtitle:
      'Bu uygulamayı kim kullanacak? Bu kullanıcının günlük hayatında bu problem ne kadar sık karşısına çıkıyor?',
    placeholder:
      'Örn: 25–40 yaş arası çalışan ebeveynler. Her hafta alışveriş yapıyorlar ve sürekli bir şeyleri unutuyorlar...',
    icon: '👤',
    color: '#FF6B9D',
  },
  {
    id: 'q3',
    key: 'scope',
    step: 3,
    title: '📦 MVP Kapsamı Nedir?',
    subtitle:
      'İlk sürüm tam olarak ne yapacak, ne yapmayacak? (Yapacakları ve yapmayacakları listele)',
    placeholder:
      'YAPACAK: Liste oluşturma, öğe ekleme, bildirim. YAPMAYACAK: Paylaşım, barkod okuma, fiyat takibi...',
    icon: '📦',
    color: '#4ECDC4',
  },
  {
    id: 'q4',
    key: 'constraints',
    step: 4,
    title: '⛔ Kısıtlar Neler?',
    subtitle:
      'Bu uygulamayı geliştirirken karşılaşacağın teknik, zaman veya kaynak kısıtları neler?',
    placeholder:
      'Örn: 3 haftalık süre kısıtı var. Backend yok, offline çalışmalı. iOS öncelik ama Android da olmalı...',
    icon: '⛔',
    color: '#FFB347',
  },
  {
    id: 'q5',
    key: 'solution',
    step: 5,
    title: '💡 Çözüm Yaklaşımı?',
    subtitle:
      'Bu problemi çözmek için hangi teknik yaklaşımı benimseyeceksin? Alternatiflerle karşılaştır.',
    placeholder:
      'Örn: Widget + minimal liste uygulaması seçtim. Alternatif olarak sesli giriş düşündüm ama kompleks buldum...',
    icon: '💡',
    color: '#A8E6CF',
  },
];

export const TOTAL_STEPS = ENGINEERING_QUESTIONS.length;
