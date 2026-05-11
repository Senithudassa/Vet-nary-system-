"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuth, LoginPortal } from "@/context/AuthContext";

// ─── Tab Config ───────────────────────────────────────────────────────────────

interface Tab {
  portal: LoginPortal;
  label: string;
  icon: React.ElementType;
  accentColor: string;
  headerBg: string;
  placeholder: string;
}

const TABS: Tab[] = [
  {
    portal: "vet",
    label: "Vet / Clinic",
    icon: Stethoscope,
    accentColor: "#818CF8",
    headerBg: "bg-[#818CF8]",
    placeholder: "vet@clinic.com",
  },
  // {
  //   portal: "minor_admin",
  //   label: "Minor Admin",
  //   icon: Shield,
  //   accentColor: "#0EA5E9",
  //   headerBg: "bg-[#0EA5E9]",
  //   placeholder: "admin@branch.com",
  // },
  {
    portal: "main_admin",
    label: "Main Admin",
    icon: ShieldCheck,
    accentColor: "#10B981",
    headerBg: "bg-[#10B981]",
    placeholder: "admin@vetnary.io",
  },
];

const ROLE_ROUTES: Record<string, string> = {
  main_admin: "/main-admin",
  minor_admin: "/minor-admin",
  vet: "/vet",
  customer: "/",
};

import { authService } from "@/app/services/auth.service";

// ─── Pending Screen ───────────────────────────────────────────────────────────

function PendingScreen({
  clinicName,
  clinicId,
  onReload,
  onSignOut,
}: {
  clinicName: string;
  clinicId: string;
  onReload: (status: string) => void;
  onSignOut: () => void;
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  const handleReload = async () => {
    setIsChecking(true);
    setCheckError("");
    try {
      const fresh = await authService.getClinicDetails(clinicId);
      onReload(fresh.status);
    } catch {
      setCheckError("Could not reach the server. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#FAF9F6]">
      <div
        className="bg-white border-4 border-black rounded-xl p-10 text-center max-w-sm w-full"
        style={{ boxShadow: "8px 8px 0px #000" }}
      >
        <div className="w-16 h-16 bg-amber-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-amber-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-black mb-2">
          Pending Approval
        </h1>
        <p className="text-gray-600 font-semibold mb-1">
          <span className="font-black text-black">{clinicName}</span>
        </p>
        <p className="text-gray-500 text-sm font-medium mb-6">
          Your clinic registration is under review by a Main Admin. You will be
          notified once it is approved.
        </p>
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg px-4 py-3 text-amber-700 text-xs font-semibold mb-4">
          Status: <span className="font-black uppercase">Pending</span>
        </div>

        {checkError && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 text-xs font-semibold rounded-lg px-4 py-2 mb-4">
            {checkError}
          </div>
        )}

        <button
          onClick={handleReload}
          disabled={isChecking}
          className="w-full bg-[#818CF8] text-white font-black text-sm py-3 border-4 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none flex items-center justify-center gap-2 mb-3"
          style={{ boxShadow: "4px 4px 0px #000" }}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Status…
            </>
          ) : (
            "Check Approval Status"
          )}
        </button>

        <button
          onClick={onSignOut}
          disabled={isChecking}
          className="w-full bg-white text-black font-black text-sm py-3 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-40 focus:outline-none"
          style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #555" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [activeTab, setActiveTab] = useState<LoginPortal>("vet");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const router = useRouter();
  const { signIn, role, clinic, loading, signOut } = useAuth();

  // Banner for users who just registered
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") setJustRegistered(true);
  }, []);

  // Once role is set after login, route to the correct dashboard
  useEffect(() => {
    if (!loading && role) {
      // For vets: only navigate if clinic is APPROVED (or there's no clinic data)
      if (role === "vet" && clinic) {
        // Pending check happens in render — don't redirect
        if (clinic.status !== "APPROVED") return;
      }
      const destination = ROLE_ROUTES[role] ?? "/";
      router.push(destination);
    }
  }, [role, loading, clinic, router]);

  // Reset form fields when switching tabs
  const handleTabChange = (portal: LoginPortal) => {
    setActiveTab(portal);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const { error: signInError } = await signIn(activeTab, email, password);
      if (signInError) setError(signInError);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── Pending Screen for VET ─────────────────────────────────────────────────
  if (!loading && role === "vet" && clinic && clinic.status !== "APPROVED") {
    return (
      <PendingScreen
        clinicName={clinic.name}
        clinicId={clinic.id}
        onReload={(status) => {
          if (status === "APPROVED") {
            router.push(ROLE_ROUTES["vet"]);
          }
        }}
        onSignOut={async () => {
          await signOut();
          router.push("/login");
        }}
      />
    );
  }

  const currentTab = TABS.find((t) => t.portal === activeTab)!;

  // ── Full-screen loading overlay while auth is resolving ────────────────────
  if (loading && !isLoggingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#818CF8]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-[#FAF9F6]">
      {/* Branding */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8"
        aria-label="Go to VetNary homepage"
      >
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
        <div
          className={`${currentTab.headerBg} px-8 pt-6 pb-0 transition-colors duration-300`}
        >
          <h1 className="text-2xl font-black text-white">SIGN IN</h1>
          <p className="text-white/70 font-semibold mt-1 text-sm mb-5">
            Access your specialized portal securely.
          </p>

          {/* Tabs */}
          <div className="flex justify-center border-b-4 border-black -mx-8 px-4 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.portal;
              return (
                <button
                  key={tab.portal}
                  type="button"
                  onClick={() => handleTabChange(tab.portal)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-wide rounded-t-md transition-all focus:outline-none
                    ${
                      isActive
                        ? "bg-white text-black border-2 border-b-0 border-black"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          noValidate
          aria-label="Sign in form"
          className="px-8 py-6 space-y-5"
        >
          {/* Registered Success Banner */}
          {justRegistered && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-3 bg-green-50 border-2 border-green-600 text-green-700 text-sm p-3 rounded-md font-semibold"
            >
              <CheckCircle
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>
                Account created! Sign in with your new credentials below.
              </span>
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
            <label
              htmlFor="email"
              className="block text-xs font-black text-black uppercase tracking-wide"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder={currentTab.placeholder}
              required
              aria-required="true"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 transition-shadow"
              style={{
                borderWidth: "3px",
                // @ts-ignore
                "--tw-ring-color": currentTab.accentColor,
              }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-black text-black uppercase tracking-wide"
              >
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-bold hover:underline focus:outline-none rounded"
                style={{ color: currentTab.accentColor }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                aria-required="true"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-black rounded-md px-4 py-3 pr-12 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 transition-shadow"
                style={{ borderWidth: "3px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoggingIn || loading}
            aria-busy={isLoggingIn}
            className="w-full text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-offset-2 flex items-center justify-center gap-2"
            style={{
              backgroundColor: currentTab.accentColor,
              boxShadow: "5px 5px 0px #000",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating…
              </>
            ) : (
              "SIGN IN SECURELY"
            )}
          </button>

          {activeTab === "vet" && (
            <p className="text-center text-sm font-semibold text-gray-600 pt-1">
              No clinic account?{" "}
              <Link
                href="/register"
                className="font-black underline hover:no-underline"
                style={{ color: currentTab.accentColor }}
              >
                Register now
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
