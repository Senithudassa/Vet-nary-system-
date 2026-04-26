import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomAlert } from '@/components/ui/custom-alert';

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const { signUpCustomer } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await signUpCustomer({
                firstName,
                lastName,
                email,
                password,
            });

            if (res.error) {
                setError(res.error);
            } else {
                setShowAlert(true);
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
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

                    <View style={styles.header}>
                        <Text style={styles.logo}>VetNary<Text style={styles.logoDot}>.io</Text></Text>
                        <Text style={styles.subtitle}>Create your pet owner account.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>CREATE ACCOUNT</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>FIRST NAME</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="John" 
                                    placeholderTextColor="#999"
                                    value={firstName} 
                                    onChangeText={setFirstName} 
                                />
                            </View>
                            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>LAST NAME</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Doe" 
                                    placeholderTextColor="#999"
                                    value={lastName} 
                                    onChangeText={setLastName} 
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>EMAIL ADDRESS</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="petlover@example.com" 
                                placeholderTextColor="#999"
                                value={email} 
                                onChangeText={setEmail} 
                                autoCapitalize="none" 
                                keyboardType="email-address" 
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Min. 8 characters" 
                                placeholderTextColor="#999"
                                value={password} 
                                onChangeText={setPassword} 
                                secureTextEntry 
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.btn, loading && { opacity: 0.7 }]} 
                            onPress={handleRegister} 
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CREATE ACCOUNT</Text>}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login' as any)}>
                                <Text style={styles.footerLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlert 
                visible={showAlert}
                title="Success"
                message="Account created! Please log in."
                onClose={() => {
                    setShowAlert(false);
                    router.replace('/login' as any);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF9F6' },
    inner: { flexGrow: 1, padding: 24 },
    header: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
    logo: { fontSize: 40, fontWeight: '900', color: '#000', letterSpacing: -1 },
    logoDot: { color: '#818CF8' },
    subtitle: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 8, textAlign: 'center' },
    card: {
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    cardTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20, letterSpacing: 0.5 },
    errorBox: {
        backgroundColor: '#FEE2E2',
        borderWidth: 2,
        borderColor: '#EF4444',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    errorText: { color: '#B91C1C', fontWeight: '700', fontSize: 14 },
    row: { flexDirection: 'row' },
    field: { marginBottom: 16 },
    label: { fontSize: 10, fontWeight: '900', color: '#000', marginBottom: 4, letterSpacing: 0.5 },
    input: {
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
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
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 40 },
    footerText: { fontSize: 14, color: '#666', fontWeight: '600' },
    footerLink: { fontSize: 14, color: '#818CF8', fontWeight: '900' },
});
