export type Idea = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'done';
  createdAt: string;
};

export const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Akıllı Alışveriş Listesi',
    description:
      'Buzdolabı içeriğini analiz eden ve eksik malzemeleri otomatik olarak alışveriş listesine ekleyen bir uygulama. Kullanıcılar fotoğraf çekerek buzdolabı içeriğini tararlar, AI hangi malzemelerin eksik olduğunu tahmin eder.',
    status: 'open',
    createdAt: '2026-05-10',
  },
  {
    id: '2',
    title: 'Uzaktan Çalışma Verimliliği Asistanı',
    description:
      'Toplantı takvimini, odaklanma bloklarını ve mola sürelerini akıllıca dengeleyen bir asistan. Pomodoro tekniğini takım takvimiyle senkronize ederek her ekip üyesi için optimum çalışma ritmi oluşturur.',
    status: 'open',
    createdAt: '2026-05-12',
  },
  {
    id: '3',
    title: 'Çok Uzun Başlıklı Fikir — Detay Sayfasında Bu Başlık Metninin Taşması Layout Sorununa Yol Açıyor ve Düzeltilmeli',
    description:
      'Bu fikrin kasıtlı olarak çok uzun bir başlığı vardır. Amaç, detay ekranındaki metin taşması hatasını ortaya çıkarmak ve audit widget ile raporlayarak forge cycle ile düzeltmektir.',
    status: 'open',
    createdAt: '2026-05-15',
  },
];
