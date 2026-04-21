import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AnalysisResult } from '../types';

export async function generatePdfReport(result: AnalysisResult, pitch: string) {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page { margin: 20mm; }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #0f172a; 
            background-color: #ffffff; 
            margin: 0;
            padding: 0;
            line-height: 1.4;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .header { 
            border-bottom: 2px solid #7c3aed; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo { font-size: 24px; font-weight: 900; color: #7c3aed; letter-spacing: -1px; }
          .report-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          
          .main-grid { display: flex; gap: 20px; margin-bottom: 20px; }
          .score-card { 
            flex: 1; 
            background: #f8fafc; 
            border-radius: 12px; 
            padding: 15px; 
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .summary-card { flex: 2; }
          
          .score-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          .score-value { 
            font-size: 48px; 
            font-weight: 900; 
            color: ${result.slopScore > 60 ? '#ef4444' : '#22c55e'}; 
            line-height: 1;
            margin-bottom: 5px;
          }
          .score-status { font-size: 12px; font-weight: 700; color: ${result.slopScore > 60 ? '#ef4444' : '#22c55e'}; }
          
          .section-title { 
            font-size: 14px; 
            font-weight: 800; 
            color: #1e293b; 
            margin-bottom: 12px; 
            padding-left: 8px;
            border-left: 4px solid #7c3aed;
          }
          .summary-text { font-size: 13px; color: #334155; text-align: justify; }
          
          .claims-list { margin-top: 15px; }
          .claim-item { 
            background: #ffffff; 
            border: 1px solid #f1f5f9;
            border-radius: 8px; 
            padding: 12px; 
            margin-bottom: 10px;
          }
          .verdict-badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 4px; 
            font-size: 10px; 
            font-weight: 800; 
            margin-bottom: 6px; 
          }
          .v-GÜÇLÜ { background: #dcfce7; color: #15803d; }
          .v-ABARTILI { background: #ffedd5; color: #c2410c; }
          .v-DOĞRULANAMAZ { background: #fee2e2; color: #b91c1c; }
          
          .claim-text { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
          .claim-reason { font-size: 12px; color: #64748b; }
          
          .recommendation-box { 
            background: #7c3aed0a; 
            border: 1px dashed #7c3aed44; 
            padding: 15px; 
            border-radius: 12px;
            margin-top: 20px;
          }
          .recommendation-text { font-size: 13px; font-style: italic; color: #4338ca; }
          
          .footer { 
            margin-top: 30px; 
            padding-top: 10px; 
            border-top: 1px solid #e2e8f0; 
            font-size: 10px; 
            color: #94a3b8; 
            display: flex; 
            justify-content: space-between; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NOKTA</div>
            <div class="report-title">Startup Due Diligence Raporu</div>
          </div>
          
          <div class="main-grid">
            <div class="score-card">
              <div class="score-label">Slop Skoru</div>
              <div class="score-value">${result.slopScore}</div>
              <div class="score-status">
                ${result.slopScore < 35 ? 'GÜVENLİ' : result.slopScore < 65 ? 'ORTA RİSK' : 'YÜKSEK RİSK'}
              </div>
            </div>
            <div class="summary-card">
              <div class="section-title">Yönetici Özeti</div>
              <div class="summary-text">${result.summary}</div>
            </div>
          </div>

          <div class="section-title">Detaylı Bulgular</div>
          <div class="claims-list">
            ${result.claims.map(c => `
              <div class="claim-item">
                <div class="verdict-badge v-${c.verdict}">${c.verdict}</div>
                <div class="claim-text">${c.text}</div>
                <div class="claim-reason">${c.reasoning}</div>
              </div>
            `).join('')}
          </div>

          <div class="section-title">Yatırımcı Önerisi</div>
          <div class="recommendation-box">
            <div class="recommendation-text">"${result.recommendation}"</div>
          </div>

          <div class="footer">
            <div>Oluşturma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
            <div>Powered by Nokta AI Engine</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
}
