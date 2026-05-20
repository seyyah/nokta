/**
 * Veri işleme ve temizleme araçları
 */

// Kirli veriyi (Örn: "$10.000", "%85", "1.250,50") saf sayıya dönüştürür
export function parseNumeric(val) {
  if (val === undefined || val === null || val === '') return 0;

  // Zaten sayıysa direkt döndür
  if (typeof val === 'number') return val;

  let str = val.toString().trim();

  // 1. Adım: Para birimi, yüzde ve birim sembollerini temizle
  // (Regex ile tüm yaygın birimleri tek seferde temizleriz)
  str = str.replace(/[$.%€£\s]|TL|ADET/gi, '');

  if (!str) return 0;

  // 2. Adım: Avrupa/Türkiye formatı kontrolü (Örn: 1.250,50)
  // Eğer hem nokta hem virgül varsa, nokta binliktir, virgül ondalıktır.
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  // Sadece virgül varsa (Örn: 10,50), onu noktaya çevir ki JS anlayabilsin
  else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  // Sadece nokta varsa ve sonrasında 3 rakam varsa (Örn: 10.000), o bir binlik ayracıdır
  else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts[parts.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(str);

  // Eğer sonuç hala sayı değilse (NaN), 0 döndür
  return isNaN(parsed) ? 0 : parsed;
}

// Grafiklerde ve kartlarda sayıları şık göstermek için (Örn: 10000 -> 10.000)
export function formatNumeric(val) {
  if (typeof val !== 'number') return val;
  return val.toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}