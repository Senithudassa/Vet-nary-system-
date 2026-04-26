"use client";

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { FullPageLoader } from "./loader/full-page-loader"

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<"vet" | "minor_admin" | "main_admin" | "customer">;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // 1. Not logged in -> Kick to Login
            if (!user) {
                router.push("/login");
                return;
            }

            // 2. Logged in, but unauthorized for this specific page -> Kick to their native home
            if (role && !allowedRoles.includes(role)) {
                if (role === "main_admin") router.push("/main-admin");
                else if (role === "minor_admin") router.push("/minor-admin");
                else if (role === "vet") router.push("/vet");
                else router.push("/");
            } else if (user && !role) {
                // If they have a user but no role yet (limbo), send them to wait or refresh
                // Assuming standard customers get role 'customer', if it's strictly empty, push to home
                router.push("/");
            }
        }
    }, [user, role, loading, allowedRoles, router]);

    // Show spinner while checking Supabase Auth State
    if (loading) {
        return <FullPageLoader message="Verifying Zero Trust Credentials..." />
    }

    // Only render the actual page content if they passed the role check
    if (user && role && allowedRoles.includes(role)) {
        return <>{children}</>
    }

    // Fallback while the router is pushing them away
    return null;
}
