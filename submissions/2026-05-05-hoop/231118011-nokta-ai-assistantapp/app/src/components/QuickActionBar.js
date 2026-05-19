import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAssistantStore } from "../store/assistantStore";

const QUICK_PROMPTS = [
  {
    label: "Fikrimi netleştir",
    text: "Bir uygulama fikrim var ama tam net değil. Bana 3-5 mühendislik sorusu sorarak fikri netleştir."
  },
  {
    label: "Spec üret",
    text: "Bu fikri tek sayfalık ürün spesifikasyonuna dönüştürmek istiyorum. Bana gerekli başlıkları ve akışı çıkar."
  },
  {
    label: "Slop kontrol",
    text: "Fikrimin zayıf, genel veya temelsiz taraflarını bul. Bana dürüst bir slop analizi yap."
  }
];

export const QuickActionBar = () => {
  const setInputText = useAssistantStore((state) => state.setInputText);
  const sendMessageToAssistant = useAssistantStore((state) => state.sendMessageToAssistant);
  const isThinking = useAssistantStore((state) => state.isThinking);

  const handleQuickPrompt = async (prompt) => {
    if (isThinking) {
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Sessiz geç.
    }

    setInputText(prompt.text);
    await sendMessageToAssistant(prompt.text);
  };

  return (
    <View style={styles.container}>
      {QUICK_PROMPTS.map((prompt) => (
        <Pressable
          key={prompt.label}
          onPress={() => handleQuickPrompt(prompt)}
          style={({ pressed }) => [styles.chip, pressed ? styles.chipPressed : null]}
        >
          <Text style={styles.chipText}>{prompt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  chipPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  chipText: {
    color: "#EAF6FF",
    fontSize: 12.5,
    fontWeight: "800"
  }
});