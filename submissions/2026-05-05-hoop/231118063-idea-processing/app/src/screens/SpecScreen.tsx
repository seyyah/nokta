import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Theme } from '../theme';
import { GlassContainer } from '../components/GlassContainer';
import { Share2, Home, Download } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'Spec'>;

export const SpecScreen: React.FC<Props> = ({ navigation, route }) => {
  const { answers, dot } = route.params;

  const specMarkdown = `
# PROJE SPESİFİKASYONU: ${dot.substring(0, 30)}${dot.length > 30 ? '...' : ''}

**Tarih:** ${new Date().toLocaleDateString('tr-TR')}
**Modül:** Nokta Spec-Gen (Track A)

---

## 1. PROBLEM VE ÇÖZÜM
${answers.problem || 'Belirtilmedi'}

## 2. TEKNİK VE OPERASYONEL KISITLAR
${answers.constraints || 'Belirtilmedi'}

## 3. BAŞARI METRİKLERİ
${answers.success || 'Belirtilmedi'}

## 4. HEDEF KİTLE (PERSONA)
${answers.persona || 'Belirtilmedi'}

## 5. MVP KAPSAMI (ÖNCELİKLER)
${answers.mvp || 'Belirtilmedi'}

---
> Bu döküman NOKTA tarafından otonom olarak türetilmiştir. 
> "No-Slop, Pure Engineering."
  `;

  const handleShare = async () => {
    try {
      await Share.share({
        message: specMarkdown,
        title: 'Proje Spesifikasyonu',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              background-color: #0D0D0D; 
              color: #FFFFFF; 
              padding: 40px; 
              line-height: 1.6;
            }
            h1 { color: #00D1FF; font-size: 32px; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #FF00E5; font-size: 24px; margin-top: 30px; margin-bottom: 10px; }
            p { font-size: 16px; margin-bottom: 20px; }
            hr { border: 0; border-top: 1px solid #333; margin: 30px 0; }
            .meta { color: #A0A0A0; font-size: 14px; margin-bottom: 5px; }
            blockquote { 
              background: rgba(255, 255, 255, 0.05); 
              border-left: 5px solid #00D1FF; 
              padding: 15px; 
              margin: 20px 0; 
              font-style: italic;
              color: #A0A0A0;
            }
          </style>
        </head>
        <body>
          <p class="meta"><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
          <p class="meta"><strong>Modül:</strong> Nokta Spec-Gen (Track A)</p>
          
          <h1>PROJE SPESİFİKASYONU: ${dot}</h1>
          
          <hr />

          <h2>1. PROBLEM VE ÇÖZÜM</h2>
          <p>${answers.problem ? answers.problem.replace(/\n/g, '<br/>') : 'Belirtilmedi'}</p>

          <h2>2. TEKNİK VE OPERASYONEL KISITLAR</h2>
          <p>${answers.constraints ? answers.constraints.replace(/\n/g, '<br/>') : 'Belirtilmedi'}</p>

          <h2>3. BAŞARI METRİKLERİ</h2>
          <p>${answers.success ? answers.success.replace(/\n/g, '<br/>') : 'Belirtilmedi'}</p>

          <h2>4. HEDEF KİTLE (PERSONA)</h2>
          <p>${answers.persona ? answers.persona.replace(/\n/g, '<br/>') : 'Belirtilmedi'}</p>

          <h2>5. MVP KAPSAMI (ÖNCELİKLER)</h2>
          <p>${answers.mvp ? answers.mvp.replace(/\n/g, '<br/>') : 'Belirtilmedi'}</p>

          <hr />
          <blockquote>
            Bu döküman NOKTA tarafından otonom olarak türetilmiştir. <br/>
            "No-Slop, Pure Engineering."
          </blockquote>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GlassContainer style={styles.specBox}>
          <Markdown style={markdownStyles}>
            {specMarkdown}
          </Markdown>
        </GlassContainer>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color={Theme.colors.primary} />
            <Text style={styles.actionText}>PAYLAŞ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportPDF}>
            <Download size={20} color={Theme.colors.primary} />
            <Text style={styles.actionText}>PDF İNDİR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.popToTop()}
        >
          <Home size={20} color="#000" />
          <Text style={styles.homeButtonText}>YENİ NOKTA OLUŞTUR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  specBox: {
    minHeight: 400,
    backgroundColor: Theme.colors.surface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
  },
  actionText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.roundness.md,
    gap: 12,
    marginBottom: 60,
  },
  homeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  heading1: {
    color: Theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 20,
  },
  heading2: {
    color: Theme.colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  hr: {
    backgroundColor: Theme.colors.border,
    height: 1,
    marginVertical: 20,
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftColor: Theme.colors.primary,
    borderLeftWidth: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 4,
  },
});
