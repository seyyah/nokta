export const USE_CASES = [
  {
    id: 'reduce-noshows',
    title: 'Randevu İptalini Azalt',
    subtitle: 'Otomatik hatırlatmalar ve online rezervasyonla hasta kayıplarını önle.',
    icon: 'calendar-outline',
    specialty: 'dentist',
    components: ['booking', 'appointment-reminder'],
  },
  {
    id: 'remote-cardiology',
    title: 'Uzaktan Kardiyoloji Takibi',
    subtitle: 'Kronik hastalara video görüşme, ilaç takibi ve güvenli mesajlaşma sun.',
    icon: 'videocam-outline',
    specialty: 'cardiologist',
    components: ['telehealth', 'medication-tracker', 'secure-messaging'],
  },
  {
    id: 'risk-assessment',
    title: 'Klinik Risk Hesaplama',
    subtitle: 'ASCVD ve CHA₂DS₂-VASc skoru ile kanıta dayalı karar desteği.',
    icon: 'pulse-outline',
    specialty: 'cardiologist',
    components: ['ascvd-calculator', 'chads2vasc-calculator'],
  },
  {
    id: 'patient-education',
    title: 'Hasta Eğitimi & Takip',
    subtitle: 'Taburculuk sonrası eğitim kartları ve semptom kontrol listesi.',
    icon: 'book-outline',
    specialty: 'cardiologist',
    components: ['patient-education', 'follow-up-checklist'],
  },
  {
    id: 'dental-full',
    title: 'Diş Kliniği Tam Paket',
    subtitle: 'Rezervasyon, hatırlatma, tedavi planı ve güvenli mesajlaşma.',
    icon: 'medical-outline',
    specialty: 'dentist',
    components: ['booking', 'appointment-reminder', 'treatment-plan', 'secure-messaging'],
  },
  {
    id: 'shift-handoff',
    title: 'Vardiya Devir Teslimi',
    subtitle: 'Hemşireler arası yapılandırılmış teslim ve hasta vital takibi.',
    icon: 'swap-horizontal-outline',
    specialty: 'nurse',
    components: ['shift-handoff', 'patient-vitals', 'patient-education'],
  },
  {
    id: 'tele-dentistry',
    title: 'Uzaktan Diş Muayenesi',
    subtitle: 'Hastalar fotoğraf göndererek kliniğe gelmeden triyaj yaptırır.',
    icon: 'camera-outline',
    specialty: 'dentist',
    components: ['tele-dentistry', 'secure-messaging'],
  },
  {
    id: 'oral-hygiene',
    title: 'Ağız Bakımı Alışkanlığı',
    subtitle: 'Oyunlaştırma ile fırçalama takibi ve hasta motivasyonu.',
    icon: 'trophy-outline',
    specialty: 'dentist',
    components: ['gamification', 'oral-health-tips'],
  },

  // Orthopedics
  {
    id: 'post-op-recovery',
    title: 'Ameliyat Sonrası Takip',
    subtitle: 'Taburculuktan sonra egzersiz programı ve ağrı takibi ile iyileşmeyi hızlandır.',
    icon: 'barbell-outline',
    specialty: 'orthopedics',
    components: ['exercise-tracker', 'pain-tracker', 'appointment-reminder'],
  },
  {
    id: 'pre-op-prep',
    title: 'Ameliyat Hazırlığı',
    subtitle: 'Hastaya ameliyat öncesi kontrol listesi ve güvenli mesajlaşma.',
    icon: 'checkbox-outline',
    specialty: 'orthopedics',
    components: ['pre-op-checklist', 'secure-messaging', 'booking'],
  },
  {
    id: 'koos-monitoring',
    title: 'Diz Fonksiyon Takibi',
    subtitle: 'KOOS skoru ile diz eklemi iyileşmesini periyodik olarak ölç.',
    icon: 'body-outline',
    specialty: 'orthopedics',
    components: ['koos-score', 'pain-tracker', 'appointment-reminder'],
  },

  // Psychiatry
  {
    id: 'anxiety-management',
    title: 'Kaygı & Depresyon Takibi',
    subtitle: 'PHQ-9 ve GAD-7 ile semptom izleme, ruh hali günlüğü ve kriz desteği.',
    icon: 'heart-half-outline',
    specialty: 'psychiatry',
    components: ['phq9', 'gad7', 'mood-tracker', 'crisis-resources'],
  },
  {
    id: 'telepsych',
    title: 'Uzaktan Psikiyatri',
    subtitle: 'Video görüşme, güvenli mesajlaşma ve ilaç hatırlatıcısı.',
    icon: 'videocam-outline',
    specialty: 'psychiatry',
    components: ['telehealth', 'secure-messaging', 'medication-tracker'],
  },

  // Nephrology
  {
    id: 'ckd-monitoring',
    title: 'KBH Takibi',
    subtitle: 'CKD-EPI ve MDRD ile GFR takibi, lab sonuçları ve ilaç yönetimi.',
    icon: 'water-outline',
    specialty: 'nephrology',
    components: ['ckd-epi', 'mdrd-gfr', 'patient-vitals', 'medication-tracker'],
  },
  {
    id: 'kidney-education',
    title: 'Böbrek Sağlığı Eğitimi',
    subtitle: 'Hasta eğitim kartları ve düzenli poliklinik takip hatırlatmaları.',
    icon: 'book-outline',
    specialty: 'nephrology',
    components: ['patient-education', 'appointment-reminder', 'booking'],
  },

  // Hepatology
  {
    id: 'liver-monitoring',
    title: 'Karaciğer Hastalığı Takibi',
    subtitle: 'MELD skoru ile hastalık şiddetini izle ve ilaç uyumunu destekle.',
    icon: 'water-outline',
    specialty: 'hepatology',
    components: ['meld', 'meld-na', 'medication-tracker', 'appointment-reminder'],
  },

  // Pulmonology
  {
    id: 'pneumonia-risk',
    title: 'Pnömoni Risk & Taburculuk',
    subtitle: 'PSI/PORT ve Caprini VTE ile risk değerlendirme ve taburculuk planı.',
    icon: 'partly-sunny-outline',
    specialty: 'pulmonology',
    components: ['psi-port', 'caprini-vte', 'patient-education'],
  },
];
