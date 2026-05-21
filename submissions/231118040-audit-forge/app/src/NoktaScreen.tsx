import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getScreen, screens, ScreenId } from './screens';

type Props = {
  screenId: ScreenId;
};

export function NoktaScreen({ screenId }: Props) {
  const router = useRouter();
  const currentScreen = getScreen(screenId);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.brand}>Nokta Audit Forge</Text>
          <Text style={styles.subtitle}>Drop-in audit widget + agent repair ledger</Text>
        </View>

        <View style={styles.tabs}>
          {screens.map((screen) => {
            const selected = screen.id === screenId;
            return (
              <Pressable
                key={screen.id}
                onPress={() => router.push(screen.route)}
                style={[styles.tab, selected && styles.tabActive]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>{screen.id}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>{currentScreen.eyebrow}</Text>
            <Text style={styles.title}>{currentScreen.title}</Text>
            <Text style={styles.body}>{currentScreen.body}</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Audit state</Text>
              <Text style={styles.metricValue}>{currentScreen.metric}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Host boundary</Text>
            <Text style={styles.panelText}>
              Audit widget native paketleri dogrudan import etmez; capture, file write, share ve storage
              host uygulamadan deps ile enjekte edilir.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Forge ratchet</Text>
            <Text style={styles.panelText}>
              Her audit raporu tek bir 15 dakikalik cycle'a girer. Test veya verify gecmezse rollback
              kayit altina alinir ve ayni hipotez tekrar denenmez.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  header: {
    gap: 4,
    marginBottom: 18,
  },
  brand: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#526070',
    fontSize: 13,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderColor: '#cad5e2',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  tabText: {
    color: '#526070',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    gap: 14,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2ec',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  metricRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 12,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2ec',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  panelText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
});
