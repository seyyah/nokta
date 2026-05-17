import { embed, cosine, findMostSimilar, DUPLICATE_THRESHOLD } from '../embeddings';

describe('embeddings', () => {
  it('aynı metnin cosine benzerliği ~1', () => {
    const a = embed('Yağmurda fikir geldi otobüste');
    const b = embed('Yağmurda fikir geldi otobüste');
    expect(cosine(a, b)).toBeCloseTo(1, 5);
  });

  it('farklı metinler düşük benzerlik verir', () => {
    const a = embed('Müzik dinlerken yeni bir uygulama fikrim oluştu');
    const b = embed('Marketten ekmek alırken kuyruk uzundu çok bekledim');
    expect(cosine(a, b)).toBeLessThan(0.4);
  });

  it('neredeyse aynı metin (copy-paste) threshold üstünde', () => {
    const a = embed(
      'Öğrenciler için ders notlarını otomatik özetleyen mobil uygulama'
    );
    const b = embed(
      'Öğrenciler için ders notlarını otomatik özetleyen mobil uygulama fikri'
    );
    expect(cosine(a, b)).toBeGreaterThan(DUPLICATE_THRESHOLD);
  });

  it('paraphrase düşük benzerlik (cheap hash limiti)', () => {
    const a = embed('müzik dinleme uygulaması');
    const b = embed('şarkı çalma yazılımı');
    expect(cosine(a, b)).toBeLessThan(DUPLICATE_THRESHOLD);
  });

  it('findMostSimilar boş corpus için null', () => {
    expect(findMostSimilar(embed('test'), [])).toBeNull();
  });

  it('findMostSimilar en yakın kaydı bulur', () => {
    const corpus = [
      { id: 'a', embedding: embed('müzik dinleme uygulaması') },
      { id: 'b', embedding: embed('öğrenci ders notu özetleyici') },
      { id: 'c', embedding: embed('bisiklet rota planlayıcı') },
    ];
    const q = embed('öğrenci ders notları için özetleme aracı');
    const r = findMostSimilar(q, corpus);
    expect(r?.id).toBe('b');
  });
});
