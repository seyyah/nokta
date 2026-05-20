import { Idea } from '../types';

export const IDEAS: Idea[] = [
  {
    id: '1',
    title: 'Görsel Hata Bildirimi',
    description: 'Kullanıcıların ekran görüntüsü üzerinden işaretleme yaparak hata bildirebilmesi.',
    category: 'UX İyileştirmesi',
    status: 'Aktif',
  },
  {
    id: '2',
    title: 'Karanlık Tema Desteği',
    description: 'Uygulama genelinde karanlık tema seçeneğinin eklenmesi.',
    category: 'Tasarım',
    status: 'Beklemede',
  },
  {
    id: '3',
    title: 'Performans Optimizasyonu',
    description: 'Listelerin daha hızlı yüklenmesi için pagination ve lazy loading yapılması.',
    category: 'Teknik Borç',
    status: 'Tamamlandı',
  },
];
