"use client";

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Single source of truth for role → route mapping
const ROLE_ROUTES: Record<string, string> = {
    main_admin: "/main-admin",
    minor_admin: "/minor-admin",
    vet: "/vet",
    customer: "/",
};

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [justRegistered, setJustRegistered] = useState(false);

    const router = useRouter();
    const { signIn, role, loading } = useAuth();

    // Banner for users who just registered
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("registered") === "true") setJustRegistered(true);
    }, []);

    // Once role is set after login, route to the correct dashboard
    // This fires when onAuthStateChange updates the context
    useEffect(() => {
        if (!loading && role) {
            const destination = ROLE_ROUTES[role] ?? "/";
            router.push(destination);
        }
    }, [role, loading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoggingIn(true);

        try {
            const { error: signInError } = await signIn(email, password);

            if (signInError) {
                setError(signInError);
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const quickLogin = async (roleEmail: string) => {
        setEmail(roleEmail);
        setPassword("password123");
        setError("");
        setIsLoggingIn(true);
        try {
            await signIn(roleEmail, "password123");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-[#FAF9F6]">

            {/* Branding */}
            <Link href="/" className="flex items-center gap-2 mb-8" aria-label="Go to VetNary homepage">
                <Activity className="h-8 w-8 text-[#818CF8]" aria-hidden="true" />
                <span className="text-3xl font-black tracking-tight text-black">
                    VetNary<span className="text-[#818CF8]">.io</span>
                </span>
            </Link>

            {/* Card */}
            <div
                className="w-full max-w-sm bg-white border-4 border-black rounded-xl overflow-hidden"
                style={{ boxShadow: "8px 8px 0px #000" }}
            >
                {/* Card Header */}
                <div className="bg-black px-8 py-6">
                    <h1 className="text-2xl font-black text-white">SIGN IN</h1>
                    <p className="text-gray-400 font-semibold mt-1 text-sm">
                        Access your specialized portal securely.
                    </p>
                </div>

                <div className="px-8 pt-6">
                    <p className="text-xs font-black text-black uppercase tracking-wide mb-3">Quick Login (Development)</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => quickLogin("main_admin@vetnary.io")}
                            className="text-[10px] bg-black text-white py-1.5 px-2 rounded-md font-bold hover:bg-gray-800 border-2 border-black"
                        >
                            Main Admin
                        </button>
                        <button
                            onClick={() => quickLogin("minor_admin@vetnary.io")}
                            className="text-[10px] bg-black text-white py-1.5 px-2 rounded-md font-bold hover:bg-gray-800 border-2 border-black"
                        >
                            Minor Admin
                        </button>
                        <button
                            onClick={() => quickLogin("vet@vetnary.io")}
                            className="text-[10px] bg-black text-white py-1.5 px-2 rounded-md font-bold hover:bg-gray-800 border-2 border-black"
                        >
                            Vet
                        </button>
                        <button
                            onClick={() => quickLogin("customer@vetnary.io")}
                            className="text-[10px] bg-black text-white py-1.5 px-2 rounded-md font-bold hover:bg-gray-800 border-2 border-black"
                        >
                            Customer
                        </button>
                    </div>
                </div>

                <form onSubmit={handleLogin} noValidate aria-label="Sign in form" className="px-8 py-6 space-y-5">

                    {/* Registered Success Banner */}
                    {justRegistered && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex items-start gap-3 bg-green-50 border-2 border-green-600 text-green-700 text-sm p-3 rounded-md font-semibold"
                        >
                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span>Account created! Sign in with your new credentials below.</span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                        >
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-black text-black uppercase tracking-wide">
                            Work Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="clinic@example.com"
                            required
                            aria-required="true"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                            style={{ borderWidth: "3px" }}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-xs font-black text-black uppercase tracking-wide">
                                Password
                            </label>
                            <Link
                                href="#"
                                className="text-xs font-bold text-[#818CF8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#818CF8] rounded"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            aria-required="true"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                            style={{ borderWidth: "3px" }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoggingIn || loading}
                        aria-busy={isLoggingIn}
                        className="w-full bg-[#818CF8] text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
                        style={{ boxShadow: "5px 5px 0px #000" }}
                    >
                        {isLoggingIn ? "Authenticating..." : "SIGN IN SECURELY"}
                    </button>

                    <p className="text-center text-sm font-semibold text-gray-600 pt-2">
                        No clinic account?{" "}
                        <Link href="/register" className="text-[#818CF8] font-black underline hover:no-underline">
                            Register now
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

// Suspense required by Next.js App Router when using useSearchParams/window.location.search in a client component
export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
