import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { type PluginSettings, usePlugins } from "@/contexts/PluginsContext";

interface PluginItem {
  key: keyof PluginSettings;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const PLUGINS: PluginItem[] = [
  {
    key: "showLineNumbers",
    label: "Satır Numaraları",
    description: "Her fikrin yanında sıra numarasını göster",
    icon: "list",
  },
  {
    key: "sortAlphabetically",
    label: "Alfabetik Sırala",
    description: "Çıktıyı alfabetik olarak sırala",
    icon: "type",
  },
  {
    key: "autoCopyToClipboard",
    label: "Otomatik Kopyala",
    description: "İşleme sonrası sonucu panoya kopyala",
    icon: "clipboard",
  },
  {
    key: "tagSuggestions",
    label: "Etiketler",
    description: "Notlara etiket ekleyebilme",
    icon: "tag",
  },
  {
    key: "caseSensitive",
    label: "Büyük/Küçük Duyarlı",
    description: "Tekrar tespitinde büyük/küçük harf farkını göz önünde bulundur",
    icon: "type",
  },
  {
    key: "stripEmojis",
    label: "Emoji Kaldır",
    description: "İşleme sırasında emojileri temizle",
    icon: "smile",
  },
  {
    key: "markdownMode",
    label: "Markdown Modu",
    description: "Çıktıyı markdown biçiminde göster (yakında)",
    icon: "file-text",
  },
];

export default function PluginsScreen() {
  const { colors } = useTheme();
  const { plugins, toggle, reset } = usePlugins();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  function handleToggle(key: keyof PluginSettings) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(key);
  }

  const activeCount = Object.values(plugins).filter(Boolean).length;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            paddingTop: webTopPad,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Eklentiler</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {activeCount} aktif
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            reset();
          }}
          style={[styles.resetBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          ÖZELLİKLER
        </Text>
        {PLUGINS.map((plugin, index) => {
          const isLast = index === PLUGINS.length - 1;
          const isDisabled = plugin.key === "markdownMode";
          return (
            <View
              key={plugin.key}
              style={[
                styles.pluginItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderBottomWidth: isLast ? 1 : 0,
                  borderTopWidth: 1,
                  borderTopLeftRadius: index === 0 ? 14 : 0,
                  borderTopRightRadius: index === 0 ? 14 : 0,
                  borderBottomLeftRadius: isLast ? 14 : 0,
                  borderBottomRightRadius: isLast ? 14 : 0,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  opacity: isDisabled ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: plugins[plugin.key] ? colors.primary : colors.secondary },
                ]}
              >
                <Feather
                  name={plugin.icon as keyof typeof Feather.glyphMap}
                  size={16}
                  color={plugins[plugin.key] ? colors.primaryForeground : colors.mutedForeground}
                />
              </View>
              <View style={styles.pluginInfo}>
                <Text style={[styles.pluginLabel, { color: colors.foreground }]}>
                  {plugin.label}
                </Text>
                <Text style={[styles.pluginDesc, { color: colors.mutedForeground }]}>
                  {plugin.description}
                </Text>
              </View>
              <Switch
                value={plugins[plugin.key]}
                onValueChange={() => { if (!isDisabled) handleToggle(plugin.key); }}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.primaryForeground}
                disabled={isDisabled}
              />
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 28 }]}>
          HAKKINDA
        </Text>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>nokta v2.0</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Messy notlarını temizle, tekrarları kaldır ve fikirlerini organize et.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 2 },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  resetText: { fontSize: 13, fontWeight: "500" },
  list: { padding: 16, gap: 0 },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  pluginItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pluginInfo: { flex: 1 },
  pluginLabel: { fontSize: 15, fontWeight: "600" },
  pluginDesc: { fontSize: 12, marginTop: 2 },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoText: { fontSize: 13, lineHeight: 20 },
});
