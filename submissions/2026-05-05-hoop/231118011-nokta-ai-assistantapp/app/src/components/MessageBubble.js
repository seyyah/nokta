import { StyleSheet, Text, View } from "react-native";

export const MessageBubble = ({ message }) => {
  const isUser = message?.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.sender, isUser ? styles.userSender : styles.assistantSender]}>
          {isUser ? "Sen" : "Nokta"}
        </Text>

        <Text style={[styles.content, isUser ? styles.userContent : styles.assistantContent]}>
          {message?.content || ""}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginVertical: 6,
    paddingHorizontal: 16
  },
  userRow: {
    alignItems: "flex-end"
  },
  assistantRow: {
    alignItems: "flex-start"
  },
  bubble: {
    maxWidth: "86%",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1
  },
  userBubble: {
    backgroundColor: "#2563EB",
    borderColor: "rgba(255,255,255,0.16)",
    borderBottomRightRadius: 6
  },
  assistantBubble: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderColor: "rgba(255,255,255,0.12)",
    borderBottomLeftRadius: 6
  },
  sender: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 5,
    letterSpacing: 0.4
  },
  userSender: {
    color: "rgba(255,255,255,0.82)"
  },
  assistantSender: {
    color: "#67E8F9"
  },
  content: {
    fontSize: 14.5,
    lineHeight: 21
  },
  userContent: {
    color: "#FFFFFF"
  },
  assistantContent: {
    color: "#EAF6FF"
  }
});