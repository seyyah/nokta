import { useMemo } from 'react';

/**
 * SmartCanvas Widget
 * Gemini tarafından üretilen ham HTML ve Tailwind CSS kodlarını render eder.
 * Statik tasarım İÇERMEZ, her şey Gemini'den gelir.
 */
export default function SmartCanvas({ title, sheetData, config }) {
  const renderedContent = useMemo(() => {
    if (!config?.htmlTemplate) return '<div style="color: #94A3B8; padding: 20px;">Tasarım bekleniyor...</div>';
    if (!sheetData || sheetData.length === 0) return '<div style="color: #94A3B8; padding: 20px;">Veri bekleniyor...</div>';

    let html = config.htmlTemplate;

    // Basit Veri Yerleştirme (Data Injection)
    // {{COL_0}}, {{COL_1}}, {{TITLE}}, {{TOTAL_ROWS}} gibi placeholder'ları değiştirir
    const headers = sheetData[0] || [];
    const rows = sheetData.slice(1);
    
    // Değişkenleri tanımla
    const variables = {
      '{{TITLE}}': title || '',
      '{{TOTAL_ROWS}}': rows.length,
      '{{SHEET_NAME}}': config.sheetName || '',
    };

    // Sütun bazlı değişkenler (İlk 10 sütun için)
    headers.forEach((header, i) => {
      variables[`{{HEADER_${i}}}`] = header;
      // Son satır verisini de ekle (KPI'lar için)
      if (rows.length > 0) {
        variables[`{{LATEST_${i}}}`] = rows[rows.length - 1][i];
      }
    });

    // Tüm değişkenleri HTML içinde değiştir
    Object.entries(variables).forEach(([key, val]) => {
      html = html.split(key).join(val);
    });

    // Eğer bir liste/tablo tasarlanacaksa (Loop), AI '{{LOOP_START}}' ve '{{LOOP_END}}' kullanabilir
    if (html.includes('{{LOOP_START}}') && html.includes('{{LOOP_END}}')) {
      const parts = html.split(/{{LOOP_START}}|{{LOOP_END}}/);
      const before = parts[0];
      const loopTemplate = parts[1];
      const after = parts[2];
      
      const loopHtml = rows.map(row => {
        let itemHtml = loopTemplate;
        row.forEach((cell, i) => {
          itemHtml = itemHtml.split(`{{COL_${i}}}`).join(cell);
        });
        return itemHtml;
      }).join('');
      
      html = before + loopHtml + after;
    }

    return html;
  }, [title, sheetData, config]);

  return (
    <div 
      className="smart-canvas-container"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
      style={{ width: '100%' }}
    />
  );
}
