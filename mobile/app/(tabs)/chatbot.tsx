import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ChatbotScreen() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi Senith! I'm your VetNary AI assistant.", isUser: false },
        { id: 2, text: "Max's vaccinations are due soon. Would you like me to find a clinic or do you have a question about his diet?", isUser: false },
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, { id: Date.now(), text: inputText, isUser: true }]);
        setInputText('');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.chatContainer}>
                        {messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.messageBubble,
                                    msg.isUser ? styles.userBubble : styles.aiBubble
                                ]}
                            >
                                {!msg.isUser && (
                                    <View style={styles.aiAvatar}>
                                        <IconSymbol name="desktopcomputer" size={16} color="#fff" />
                                    </View>
                                )}
                                <View style={[styles.messageCard, msg.isUser ? styles.userMessageCard : styles.aiMessageCard]}>
                                    <Text style={[styles.messageText, msg.isUser && { color: '#fff' }]}>{msg.text}</Text>
                                </View>
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
                        />
                    </View>
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <IconSymbol name="arrow.up" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    keyboardAvoid: {
        flex: 1,
    },
    headerBlock: {
        padding: 20,
        borderBottomWidth: 4,
        borderColor: '#000',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000',
        letterSpacing: -0.5,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#818CF8',
        marginRight: 6,
    },
    onlineText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    chatContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    messageBubble: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    userBubble: {
        justifyContent: 'flex-end',
    },
    aiBubble: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#818CF8',
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: -4,
        zIndex: 2,
    },
    messageCard: {
        maxWidth: '80%',
        padding: 16,
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    userMessageCard: {
        backgroundColor: '#000',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 4,
    },
    aiMessageCard: {
        backgroundColor: '#bae1ff', // Soft blue
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        lineHeight: 22,
    },

    inputArea: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 4,
        borderColor: '#000',
        alignItems: 'center',
    },
    inputBox: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 24,
        paddingHorizontal: 16,
        marginRight: 12,
        height: 48,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Courier',
        color: '#000',
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#818CF8',
        borderWidth: 3,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
});
