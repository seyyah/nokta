import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAssistantStore } from "../store/assistantStore";

export const FloatingInputBar = ({
  onStartListening,
  onStopListening,
  onSend,
  voiceReady = false
}) => {
  const inputText = useAssistantStore((state) => state.inputText);
  const setInputText = useAssistantStore((state) => state.setInputText);
  const isListening = useAssistantStore((state) => state.isListening);
  const isThinking = useAssistantStore((state) => state.isThinking);
  const isSpeaking = useAssistantStore((state) => state.isSpeaking);

  const handleMicPress = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Sessiz geç.
    }

    if (isListening) {
      onStopListening?.();
      return;
    }

    onStartListening?.();
  };

  const handleSendPress = async () => {
    const cleanText = String(inputText || "").trim();

    if (!cleanText || isThinking) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Sessiz geç.
    }

    onSend?.(cleanText);
  };

  const handleClearInput = () => {
    setInputText("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      style={styles.keyboardWrapper}
    >
      <BlurView intensity={35} tint="dark" style={styles.blurContainer}>
        <View style={styles.inner}>
          <Pressable
            onPress={handleMicPress}
            style={[
              styles.iconButton,
              isListening ? styles.micActive : null,
              !voiceReady ? styles.micDisabled : null
            ]}
          >
            <Text style={styles.iconText}>{isListening ? "■" : "🎙️"}</Text>
          </Pressable>

          <View style={styles.inputWrapper}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nokta'ya fikrini yaz..."
              placeholderTextColor="rgba(234,246,255,0.48)"
              style={styles.input}
              multiline
              maxLength={1200}
            />

            {String(inputText || "").length > 0 ? (
              <Pressable onPress={handleClearInput} style={styles.clearInputButton}>
                <Text style={styles.clearInputText}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={handleSendPress}
            disabled={isThinking || !String(inputText || "").trim()}
            style={[
              styles.sendButton,
              isThinking || !String(inputText || "").trim() ? styles.sendButtonDisabled : null
            ]}
          >
            {isThinking || isSpeaking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendText}>➤</Text>
            )}
          </Pressable>
        </View>

        {!voiceReady ? (
          <Text style={styles.warningText}>
            Ses tanıma Expo Go'da sınırlı olabilir. Yazılı sohbet çalışır.
          </Text>
        ) : null}
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardWrapper: {
    width: "100%",
    paddingHorizontal: 14,
    paddingBottom: 12
  },
  blurContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(15,23,42,0.72)"
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)"
  },
  micActive: {
    backgroundColor: "rgba(239,68,68,0.72)"
  },
  micDisabled: {
    opacity: 0.58
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center"
  },
  input: {
    minHeight: 46,
    maxHeight: 110,
    paddingLeft: 12,
    paddingRight: 34,
    paddingVertical: 11,
    color: "#FFFFFF",
    fontSize: 14.5,
    lineHeight: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.07)"
  },
  clearInputButton: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  clearInputText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB"
  },
  sendButtonDisabled: {
    opacity: 0.45
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 2,
    marginBottom: 1
  },
  warningText: {
    color: "rgba(234,246,255,0.48)",
    fontSize: 11,
    paddingHorizontal: 16,
    paddingBottom: 10
  }
});