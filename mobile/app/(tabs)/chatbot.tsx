import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PawPrint, Send } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

export default function ChatbotScreen() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "there";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi ${firstName}! I'm your VetNary AI assistant. Ask me anything about your pet's health, diet, or care.`,
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    const userMsg: Message = { id: Date.now(), text, isUser: true };
    const typingId = Date.now() + 1;
    const typingMsg: Message = {
      id: typingId,
      text: "",
      isUser: false,
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInputText("");
    setIsSending(true);
    scrollToBottom();

    try {
      const { reply } = await api.vetChat(text);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { ...m, text: reply, isTyping: false } : m,
        ),
      );
    } catch (err: any) {
      const errorText =
        err.message || "Something went wrong. Please try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { ...m, text: errorText, isTyping: false } : m,
        ),
      );
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerBlock}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>ASK AI</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          <View style={styles.chatContainer}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {/* AI avatar — left side */}
                {!msg.isUser && (
                  <View style={styles.aiAvatar}>
                    <PawPrint color="#fff" size={18} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageCard,
                    msg.isUser ? styles.userMessageCard : styles.aiMessageCard,
                  ]}
                >
                  {msg.isTyping ? (
                    <ActivityIndicator size="small" color="#818CF8" />
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        msg.isUser && { color: "#fff" },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>

                {/* User avatar — right side */}
                {msg.isUser && (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {firstName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask VetNary AI..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              editable={!isSending}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, isSending && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={isSending}
          >
            <Send color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerBlock: {
    padding: 20,
    borderBottomWidth: 4,
    borderColor: "#000",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#818CF8",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
  },

  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  chatContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  userBubble: {
    justifyContent: "flex-end",
  },
  aiBubble: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#818CF8",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  messageCard: {
    maxWidth: "80%",
    padding: 16,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    minWidth: 60,
    minHeight: 48,
    justifyContent: "center",
  },
  userMessageCard: {
    backgroundColor: "#000",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessageCard: {
    backgroundColor: "#bae1ff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    lineHeight: 22,
  },

  inputArea: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 4,
    borderColor: "#000",
    alignItems: "center",
  },
  inputBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 12,
    height: 48,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Courier",
    color: "#000",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#818CF8",
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});
