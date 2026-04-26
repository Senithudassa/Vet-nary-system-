'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, UserProfile } from '@/lib/api';

type AuthContextType = {
    user: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpCustomer: (data: any) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUpCustomer: async () => ({ error: null }),
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                if (token) {
                    const profile = await api.getMe();
                    setUser(profile);
                }
            } catch (error) {
                console.error("Auth init error:", error);
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const data = await api.login({ email, password });
            await AsyncStorage.setItem('access_token', data.access_token);
            await AsyncStorage.setItem('refresh_token', data.refresh_token);
            const profile = await api.getMe();
            setUser(profile);
            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Login failed' };
        }
    };

    const signUpCustomer = async (data: any) => {
        try {
            await api.registerCustomer(data);
            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Registration failed' };
        }
    };

    const signOut = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUpCustomer, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
