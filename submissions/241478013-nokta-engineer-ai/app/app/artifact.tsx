import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { Download } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export default function Artifact() {
  const { spec } = useLocalSearchParams();

  // Clean up if it has the # SPECIFICATION marker at the beginning
  const cleanedSpec = (spec as string || '').replace('# SPECIFICATION\n', '').replace('# SPECIFICATION', '');

  const handleExport = async () => {
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([cleanedSpec], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '241478013-nokta-engineer-ai.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const fileUri = FileSystem.documentDirectory + '241478013-nokta-engineer-ai.md';
      await FileSystem.writeAsStringAsync(fileUri, cleanedSpec, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert("Paylaşım özelliği platformunuzda kullanılamıyor");
      }
    } catch (error: any) {
      console.error(error);
      alert(`Spesifikasyon dışa aktarılırken hata oluştu: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Markdown
            style={{
              body: { color: '#e5e5e5', fontSize: 16, lineHeight: 26 },
              heading1: { color: '#fff', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8, marginBottom: 16 },
              heading2: { color: '#fff', marginTop: 24, marginBottom: 12 },
              heading3: { color: '#fff', marginTop: 16, marginBottom: 8 },
              strong: { color: '#3b82f6' },
              list_item: { marginBottom: 8 },
              bullet_list: { marginBottom: 16 },
              code_inline: { backgroundColor: '#222', color: '#f87171', borderRadius: 4, padding: 4 },
              code_block: { backgroundColor: '#111', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333' }
            }}
          >
            {cleanedSpec || "Herhangi bir spesifikasyon sağlanmadı."}
          </Markdown>
        </View>
      </ScrollView>
      
      {(spec as string || '').includes('# SPECIFICATION') && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Download color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.exportText}>Esere dönüştür (.md) ve Paylaş</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#161616',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
