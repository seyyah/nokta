import type { EscalationRequest } from '@nokta-hoop/hoop-core';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type MentorQueueScreenProps = {
  requests: EscalationRequest[];
  loading: boolean;
  acceptingId: string | null;
  error: string | null;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onAccept: (request: EscalationRequest) => Promise<void>;
};

export function MentorQueueScreen({
  requests,
  loading,
  acceptingId,
  error,
  onBack,
  onRefresh,
  onAccept,
}: MentorQueueScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Geri</Text>
        </Pressable>
        <Text style={styles.eyebrow}>insan desteği</Text>
        <Text style={styles.title}>Mentor kuyruğu</Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={() => void onRefresh()}
          style={({ pressed }) => [
            styles.refreshButton,
            loading ? styles.disabledButton : null,
            pressed && !loading ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? 'Yenileniyor...' : 'Yenile'}
          </Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentBody}
        showsVerticalScrollIndicator={false}
      >
        {loading && requests.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#7dd3fc" />
            <Text style={styles.emptyText}>Mentor istekleri yükleniyor...</Text>
          </View>
        ) : null}

        {!loading && requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Bekleyen istek yok</Text>
            <Text style={styles.emptyText}>
              Maskot mentor istekleri burada görünecek.
            </Text>
          </View>
        ) : null}

        {requests.map((request) => {
          const accepting = acceptingId === request.id;
          return (
            <View key={request.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{request.topic}</Text>
                <Text style={styles.statusPill}>{request.status}</Text>
              </View>
              <Text style={styles.requester}>
                {request.requester.name} mentor desteği istiyor.
              </Text>
              <Text style={styles.question}>{request.question}</Text>
              <Text style={styles.room}>Oturum: {request.callId}</Text>
              <Pressable
                accessibilityRole="button"
                disabled={accepting || request.status !== 'pending'}
                onPress={() => void onAccept(request)}
                style={({ pressed }) => [
                  styles.acceptButton,
                  accepting || request.status !== 'pending'
                    ? styles.disabledButton
                    : null,
                  pressed && !accepting ? styles.buttonPressed : null,
                ]}
              >
                {accepting ? <ActivityIndicator color="#ffffff" /> : null}
                <Text style={styles.acceptButtonText}>
                  {accepting ? 'Kabul ediliyor...' : 'Kabul et ve katıl'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#7dd3fc',
    fontSize: 15,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
  },
  toolbar: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  refreshButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#13243a',
    borderWidth: 1,
    borderColor: '#295071',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#bae6fd',
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    marginHorizontal: 18,
    marginBottom: 8,
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  contentBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 8,
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: '#b6c5d4',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  statusPill: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  requester: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
  },
  question: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  room: {
    color: '#8ca3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
});
