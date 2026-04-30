import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import Markdown from 'react-native-markdown-display';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession, session } from '@/state/sessionStore';

export default function SpecScreen() {
  const s = useSession();
  const router = useRouter();

  if (!s.spec) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Henüz spec yok.</Text>
      </View>
    );
  }

  const onCopy = async () => {
    await Clipboard.setStringAsync(s.spec!.markdown);
    Alert.alert('Kopyalandı', 'Spec panoya kopyalandı');
  };

  const onShare = async () => {
    try {
      const can = await Sharing.isAvailableAsync();
      if (!can) {
        await Clipboard.setStringAsync(s.spec!.markdown);
        Alert.alert('Paylaşım yok', 'Pano kullanıldı');
        return;
      }
      await Clipboard.setStringAsync(s.spec!.markdown);
      Alert.alert('Hazır', 'Spec markdown formatında panoda. WhatsApp/Notion/Slack\'e yapıştır.');
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : String(e));
    }
  };

  const onNew = () => {
    session.reset();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {s.provider ? <StatusBadge provider={s.provider} attempts={s.attempts} /> : null}
      <Text style={styles.title}>{s.spec.title}</Text>
      <View style={styles.specBox}>
        <Markdown style={mdStyles}>{s.spec.markdown}</Markdown>
      </View>
      <View style={styles.row}>
        <Button onPress={onCopy} variant="ghost" style={styles.flex1}>
          Kopyala
        </Button>
        <Button onPress={onShare} variant="ghost" style={styles.flex1}>
          Paylaş
        </Button>
      </View>
      <Button onPress={onNew}>Yeni nokta yakala</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20, gap: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  specBox: { backgroundColor: '#141414', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  empty: { color: '#888', textAlign: 'center', marginTop: 100 },
});

const mdStyles = {
  body: { color: '#e5e5e5', fontSize: 14, lineHeight: 22 },
  heading1: { color: '#fff', fontSize: 20, fontWeight: '800' as const, marginTop: 12 },
  heading2: { color: '#fff', fontSize: 16, fontWeight: '700' as const, marginTop: 12 },
  paragraph: { color: '#d4d4d4', marginVertical: 4 },
  code_inline: { color: '#fbbf24', backgroundColor: '#222', paddingHorizontal: 4, borderRadius: 4 },
  bullet_list_icon: { color: '#888' },
  hr: { backgroundColor: '#333' },
};
