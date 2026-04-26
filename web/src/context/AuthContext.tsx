"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole = "vet" | "minor_admin" | "main_admin" | "customer";

export interface MockUser {
    id: string;
    email: string;
    user_metadata: {
        full_name: string;
        role: AppRole;
    };
}

interface AuthContextType {
    user: MockUser | null;
    role: AppRole | null;
    loading: boolean;
    getToken: () => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    getToken: async () => null,
    signIn: async () => ({ error: null }),
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<MockUser | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Initialize from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("vetnary_mock_user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser) as MockUser;
                setUser(parsedUser);
                setRole(parsedUser.user_metadata.role);
            } catch (e) {
                console.error("Failed to parse mock user", e);
                localStorage.removeItem("vetnary_mock_user");
            }
        }
        setLoading(false);
    }, []);

    // ─── signIn ───────────────────────────────────────────────────────────────
    // Mock implementation: sets role based on email or defaults to customer
    const signIn = async (email: string, _password: string): Promise<{ error: string | null }> => {
        setLoading(true);
        
        // Artificial delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let mockRole: AppRole = "customer";
        let fullName = "Sample Customer";

        if (email.includes("main_admin")) {
            mockRole = "main_admin";
            fullName = "System Administrator";
        } else if (email.includes("minor_admin")) {
            mockRole = "minor_admin";
            fullName = "Branch Manager";
        } else if (email.includes("vet")) {
            mockRole = "vet";
            fullName = "Dr. Sample Vet";
        }

        const mockUser: MockUser = {
            id: `mock-uuid-${Date.now()}`,
            email: email,
            user_metadata: {
                full_name: fullName,
                role: mockRole,
            }
        };

        setUser(mockUser);
        setRole(mockRole);
        localStorage.setItem("vetnary_mock_user", JSON.stringify(mockUser));
        setLoading(false);

        return { error: null };
    };

    // ─── signOut ──────────────────────────────────────────────────────────────
    const signOut = async () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem("vetnary_mock_user");
    };

    // ─── getToken ─────────────────────────────────────────────────────────────
    const getToken = async () => "mock-jwt-token";

    return (
        <AuthContext.Provider value={{ user, role, loading, getToken, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
