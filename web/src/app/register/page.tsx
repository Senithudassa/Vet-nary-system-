"use client";

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, CheckCircle } from "lucide-react"
export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [operatingHours, setOperatingHours] = useState("");

    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsRegistering(true);

        try {
            // Mock registration delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Done — show success message, redirect to login
            setSuccess(true);
            setTimeout(() => router.push("/login?registered=true"), 2000);

        } catch (err: any) {
            const errorMsg = err instanceof Error ? err.message : "Failed to register. Please try again.";
            setError(errorMsg);
        } finally {
            setIsRegistering(false);
        }
    };


    // ─── Success State ────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#FAF9F6]">
                <div
                    className="bg-white border-4 border-black rounded-xl p-10 text-center max-w-sm w-full"
                    style={{ boxShadow: "8px 8px 0px #000" }}
                >
                    <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" aria-hidden="true" />
                    <h1 className="text-2xl font-black text-black mb-3">Application Submitted!</h1>
                    <p className="text-gray-600 font-semibold mb-6">
                        Your clinic account has been created. Redirecting you to sign in...
                    </p>
                    <div className="h-2 bg-[#FAF9F6] border-2 border-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#818CF8] animate-[grow_2s_linear_forwards]" style={{ width: "100%" }} />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Registration Form ────────────────────────────────────────────────────
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
                className="w-full max-w-lg bg-white border-4 border-black rounded-xl overflow-hidden"
                style={{ boxShadow: "8px 8px 0px #000" }}
            >
                {/* Card Header */}
                <div className="bg-[#818CF8] px-8 py-6 border-b-4 border-black">
                    <h1 className="text-2xl font-black text-white">REGISTER YOUR CLINIC</h1>
                    <p className="text-blue-200 font-semibold mt-1 text-sm">
                        A Main Admin will review and approve your branch.
                    </p>
                </div>

                <form onSubmit={handleRegister} noValidate aria-label="Clinic registration form">
                    <div className="px-8 py-6 space-y-5">

                        {/* Error Banner */}
                        {error && (
                            <div
                                role="alert"
                                className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                            >
                                {error}
                            </div>
                        )}

                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="clinicName" className="block text-xs font-black text-black uppercase tracking-wide">
                                    Clinic Name *
                                </label>
                                <input
                                    id="clinicName"
                                    type="text"
                                    placeholder="e.g. River Edge Vet"
                                    required
                                    aria-required="true"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    className="w-full border-3 border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                    style={{ borderWidth: "3px" }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="doctorName" className="block text-xs font-black text-black uppercase tracking-wide">
                                    Primary Doctor *
                                </label>
                                <input
                                    id="doctorName"
                                    type="text"
                                    placeholder="e.g. Dr. Silva"
                                    required
                                    aria-required="true"
                                    value={doctorName}
                                    onChange={(e) => setDoctorName(e.target.value)}
                                    className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                    style={{ borderWidth: "3px" }}
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="regEmail" className="block text-xs font-black text-black uppercase tracking-wide">
                                    Work Email *
                                </label>
                                <input
                                    id="regEmail"
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
                            <div className="space-y-1.5">
                                <label htmlFor="phone" className="block text-xs font-black text-black uppercase tracking-wide">
                                    Contact Number *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="07X XXX XXXX"
                                    required
                                    aria-required="true"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                    style={{ borderWidth: "3px" }}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label htmlFor="address" className="block text-xs font-black text-black uppercase tracking-wide">
                                Clinic Address *
                            </label>
                            <textarea
                                id="address"
                                placeholder="Full physical address (used on the mobile app map)"
                                required
                                aria-required="true"
                                rows={2}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] resize-none focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                style={{ borderWidth: "3px" }}
                            />
                        </div>

                        {/* Operating Hours */}
                        <div className="space-y-1.5">
                            <label htmlFor="hours" className="block text-xs font-black text-black uppercase tracking-wide">
                                Operating Hours
                            </label>
                            <input
                                id="hours"
                                type="text"
                                placeholder="e.g. Mon–Sat 8am–6pm"
                                value={operatingHours}
                                onChange={(e) => setOperatingHours(e.target.value)}
                                className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                style={{ borderWidth: "3px" }}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="regPassword" className="block text-xs font-black text-black uppercase tracking-wide">
                                Create Password *
                            </label>
                            <input
                                id="regPassword"
                                type="password"
                                placeholder="Min. 8 characters"
                                required
                                aria-required="true"
                                minLength={8}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
                                style={{ borderWidth: "3px" }}
                            />
                            <p className="text-xs text-gray-500 font-medium">Minimum 8 characters, securely hashed.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 space-y-4">
                        <button
                            type="submit"
                            disabled={isRegistering}
                            aria-busy={isRegistering}
                            className="w-full bg-[#818CF8] text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
                            style={{ boxShadow: "5px 5px 0px #000" }}
                        >
                            {isRegistering ? "Submitting..." : "SUBMIT REGISTRATION"}
                        </button>

                        <p className="text-center text-sm font-semibold text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#818CF8] font-black underline hover:no-underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
