import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);

            if (signInError) {
                setError(signInError);
            } else {
                router.replace('/(tabs)');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>VetNary<Text style={styles.logoDot}>.io</Text></Text>
                        <Text style={styles.subtitle}>Your Pet's Health, In Your Hands.</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>SIGN IN</Text>

                        {error ? (
                            <View style={styles.errorBox} accessibilityRole="alert">
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.field}>
                            <Text style={styles.label}>EMAIL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                                textContentType="emailAddress"
                                autoComplete="email"
                                accessibilityLabel="Email input field"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                textContentType="password"
                                autoComplete="password"
                                accessibilityLabel="Password input field"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.btnText}>SIGN IN</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New pet owner? </Text>
                        <TouchableOpacity onPress={() => router.push('/register' as any)}>
                            <Text style={styles.footerLink}>Create Account</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF9F6' },
    inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 40, fontWeight: '900', color: '#000', letterSpacing: -1 },
    logoDot: { color: '#818CF8' },
    subtitle: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 8 },

    card: {
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    cardTitle: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 20, letterSpacing: 0.5 },

    errorBox: {
        backgroundColor: '#FEE2E2',
        borderWidth: 2,
        borderColor: '#EF4444',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    errorText: { color: '#B91C1C', fontWeight: '700', fontSize: 14 },

    field: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '900', color: '#000', marginBottom: 8, letterSpacing: 0.5 },
    input: {
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 6,
        padding: 14,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        backgroundColor: '#FAF9F6',
    },

    btn: {
        backgroundColor: '#818CF8',
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { fontSize: 14, color: '#666', fontWeight: '600' },
    footerLink: { fontSize: 14, color: '#818CF8', fontWeight: '900' },
});
