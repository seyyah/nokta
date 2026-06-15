import {
  documentDirectory,
  cacheDirectory,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

export function buildVoiceAuditMarkdown(params: {
  screen: string;
  transcript: string;
  reporter?: string;
}): string {
  const date = new Date().toISOString().slice(0, 10);
  return `# 🐛 Audit Raporu — nokta-audit-forge (ses)

**Uygulama:** nokta-audit-forge  
**Ekran:** ${params.screen}  
**Tarih:** ${date}  
**Raporlayan:** ${params.reporter ?? 'voice-dictation'}  
**Kaynak:** voice → STT → markdown

---

## 📱 ${params.screen}

### 🔴 Açık — Not #1 (dikte)

**Not:** ${params.transcript.trim()}

**Beklenen:** Kullanıcı aksiyonu sorunsuz tamamlanır  
**Gerçekleşen:** Dikte edilen davranış gözlemlendi

---

*Üretildi: ses diktesi / ${date}*
`;
}

export async function saveVoiceReport(
  filename: string,
  markdown: string
): Promise<string> {
  const base = documentDirectory ?? cacheDirectory ?? '';
  const uri = `${base}${filename}`;
  await writeAsStringAsync(uri, markdown, { encoding: 'utf8' });
  return uri;
}
