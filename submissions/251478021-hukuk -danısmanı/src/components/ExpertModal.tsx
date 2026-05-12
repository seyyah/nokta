import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  summarySnippet: string;
};

export function ExpertModal({ visible, onClose, summarySnippet }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Uzman avukata yönlendir</Text>
          <Text style={styles.body}>
            Bu konu bağlayıcı hukuki görüş, dava stratejisi veya dosya güvencesi için uygundur.
            Uygulama yalnızca genel bilgilendirme ve brif çıkarır; asıl hukuki süre için baroya
            kayıtlı avukattan yardım alman gerekir (demo ekranı: istek simülasyonu).
          </Text>
          {summarySnippet.length > 0 ? (
            <View style={styles.quote}>
              <Text style={styles.quoteLabel}>Dosya özeti bağlamı</Text>
              <Text style={styles.quoteText} numberOfLines={4}>
                {summarySnippet}
              </Text>
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="İletişim / baro e-postası (isteğe bağlı, demo)"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable style={styles.primaryBtn} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Uzman görüş talebini kaydet (demo)</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Kapat</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 16,
  },
  quote: {
    backgroundColor: colors.assistantBubble,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  quoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
