"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, UserProfile, ClinicDetails } from "@/app/services/auth.service";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AppRole = "vet" | "minor_admin" | "main_admin" | "customer";

export type LoginPortal = "vet" | "minor_admin" | "main_admin";

/** Shape stored in localStorage under "vetnary_session" */
interface StoredSession {
  access_token: string;
  refresh_token: string;
  profile: UserProfile;
  clinic?: ClinicDetails;
}

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole | null;
  clinic: ClinicDetails | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signIn: (
    portal: LoginPortal,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  clinic: null,
  loading: true,
  getToken: async () => null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SESSION_KEY = "vetnary_session";

function roleFromProfile(profile: UserProfile): AppRole {
  const r = profile.role?.toUpperCase();
  if (r === "VET") return "vet";
  if (r === "ADMIN" || r === "MAIN_ADMIN") return "main_admin";
  if (r === "MINOR_ADMIN") return "minor_admin";
  return "customer";
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: StoredSession = JSON.parse(raw);
        setUser(session.profile);
        setRole(roleFromProfile(session.profile));
        if (session.clinic) setClinic(session.clinic);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── signIn ─────────────────────────────────────────────────────────────────

  const signIn = async (
    portal: LoginPortal,
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      // 1. Call the correct login endpoint
      let tokens;
      if (portal === "vet") {
        tokens = await authService.loginVet({ email, password });
      } else if (portal === "main_admin") {
        tokens = await authService.loginAdmin({ email, password });
      } else {
        tokens = await authService.loginMinorAdmin({ email, password });
      }

      // 2. Fetch profile with the new access token
      const profile = await authService.getMyProfile(tokens.access_token);

      // 3. For VET role, fetch the linked clinic details
      let clinicDetails: ClinicDetails | undefined;
      if (profile.role?.toUpperCase() === "VET" && profile.clinicId) {
        clinicDetails = await authService.getClinicDetails(profile.clinicId);
      }

      // 4. Persist session to localStorage
      const session: StoredSession = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        profile,
        clinic: clinicDetails,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // 5. Update state
      setUser(profile);
      setRole(roleFromProfile(profile));
      setClinic(clinicDetails ?? null);

      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err.message : "Login failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // ── signOut ────────────────────────────────────────────────────────────────

  const signOut = async () => {
    setUser(null);
    setRole(null);
    setClinic(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // ── getToken ───────────────────────────────────────────────────────────────

  const getToken = async (): Promise<string | null> => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: StoredSession = JSON.parse(raw);
      return session.access_token ?? null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, clinic, loading, getToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
