"use client";

import Link from "next/link"
import { ArrowRight, Activity, ShieldCheck, MapPin, Smartphone, Smartphone as Android, Apple } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">

      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header
        className="px-6 lg:px-14 h-20 border-b-4 border-black flex items-center justify-between sticky top-0 bg-[#FAF9F6] z-50"
        style={{ boxShadow: "0 4px 0px #000" }}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="VetNary homepage">
          <Activity className="h-6 w-6 text-[#818CF8]" aria-hidden="true" />
          <span className="text-xl font-black tracking-tight text-black">
            VetNary<span className="text-[#818CF8]">.io</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-bold" aria-label="Main navigation">
          <a href="#features" className="text-black hover:text-[#818CF8] transition-colors focus:outline-none focus:underline">Features</a>
          <a href="#mobile" className="text-black hover:text-[#818CF8] transition-colors focus:outline-none focus:underline">Mobile App</a>
          <a href="#security" className="text-black hover:text-[#818CF8] transition-colors focus:outline-none focus:underline">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex font-black text-sm text-black border-3 border-black px-5 py-2.5 rounded-lg bg-white hover:bg-[#FAF9F6] transition-colors focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
            style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-black text-sm text-white bg-[#818CF8] border-3 border-black px-5 py-2.5 rounded-lg hover:bg-[#6366F1] transition-colors focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
            style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
          >
            Register Clinic <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* ─── Hero ────────────────────────────────────────────────────── */}
        <section
          className="w-full py-24 lg:py-36 flex flex-col items-center justify-center text-center px-4 md:px-6"
          aria-labelledby="hero-heading"
        >
          {/* Badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 bg-[#FEF9C3] border-3 border-black px-5 py-2 rounded-full font-black text-sm text-black"
            style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" /> #1 Clinic Management in Sri Lanka
          </div>

          <h1
            id="hero-heading"
            className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6 max-w-4xl text-black leading-none"
          >
            Run your vet clinic like a{" "}
            <span className="text-[#818CF8] underline decoration-8 decoration-[#FEF9C3]">modern bank.</span>
          </h1>

          <p className="max-w-[640px] text-gray-600 md:text-xl mb-12 font-semibold leading-relaxed">
            VetNary is a secure operating system for veterinary branches. Manage queuing, process billing, and sync to your customers&apos; digital VetBook.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 font-black text-base text-white bg-[#818CF8] border-4 border-black px-8 py-4 rounded-xl hover:bg-[#6366F1] transition-transform active:translate-y-1 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
              style={{ boxShadow: "6px 6px 0px #000" }}
            >
              Start Free Trial <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 font-black text-base text-black bg-white border-4 border-black px-8 py-4 rounded-xl hover:bg-[#FAF9F6] transition-transform active:translate-y-1 focus:outline-none focus:ring-3 focus:ring-[#818CF8]"
              style={{ boxShadow: "6px 6px 0px #000" }}
            >
              Access Portal
            </Link>
          </div>
        </section>

        {/* ─── Stats Bar ───────────────────────────────────────────────── */}
        <div className="border-y-4 border-black bg-black py-6 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[
              { stat: "500+", label: "Clinics Registered" },
              { stat: "24/7", label: "System Uptime" },
              { stat: "100%", label: "WCAG Compliant" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-[#FEF9C3]">{stat}</div>
                <div className="text-sm font-bold text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Features ────────────────────────────────────────────────── */}
        <section id="features" className="w-full py-24 px-4 md:px-6" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 id="features-heading" className="text-4xl font-black tracking-tight text-black mb-4">
                WHY CHOOSE VETNARY?
              </h2>
              <p className="text-gray-600 text-lg font-semibold max-w-2xl mx-auto">
                Built for high-volume branches. Designed around Sri Lanka&apos;s data privacy laws.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Activity className="h-6 w-6 text-black" aria-hidden="true" />,
                  bg: "#D1FAE5",
                  title: "Independent Branches",
                  desc: "Manage your own budgets, staff, and queues. Fully isolated from the rest of the network for maximum efficiency.",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6 text-black" aria-hidden="true" />,
                  bg: "#BAE6FD",
                  title: "Military-Grade Privacy",
                  desc: "Financial targets are cryptographically hashed. We strictly follow Sri Lanka Data Protection laws. Zero third-party sharing.",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-black" aria-hidden="true" />,
                  bg: "#FEF9C3",
                  title: "Get Discovered",
                  desc: "Appear on the VetNary Mobile app. Let pet owners find you, book appointments, and view their digital VetBooks.",
                },
              ].map(({ icon, bg, title, desc }) => (
                <div
                  key={title}
                  className="border-4 border-black rounded-xl p-6"
                  style={{ backgroundColor: bg, boxShadow: "6px 6px 0px #000" }}
                >
                  <div className="h-12 w-12 bg-white border-3 border-black rounded-lg flex items-center justify-center mb-5"
                    style={{ borderWidth: "3px" }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-xl font-black text-black mb-3">{title}</h3>
                  <p className="text-gray-700 font-semibold leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Mobile App CTA ──────────────────────────────────────────── */}
        <section
          id="mobile"
          className="w-full py-24 px-4 md:px-6 bg-[#A5B4FC] border-y-4 border-black"
          aria-labelledby="mobile-heading"
        >
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 bg-[#FEF9C3] border-3 border-black px-5 py-2 rounded-full font-black text-sm text-black mb-8"
              style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" /> For Pet Owners
            </div>
            <h2 id="mobile-heading" className="text-4xl font-black text-black mb-6">
              YOUR PET&apos;S HEALTH IN YOUR HANDS
            </h2>
            <p className="text-indigo-900 text-lg font-semibold mb-10 max-w-xl mx-auto">
              The VetNary mobile app is your digital VetBook. Book appointments, track vaccines, and scan your pet&apos;s skin condition with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="inline-flex items-center gap-3 bg-black border-4 border-[#FEF9C3] px-7 py-4 rounded-xl font-black text-white"
                style={{ boxShadow: "6px 6px 0px #FEF9C3" }}
                onClick={() => console.log("App Store clicked")}
              >
                <Apple className="h-6 w-6 text-white" aria-hidden="true" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-base">App Store</div>
                </div>
              </button>
              <button
                className="inline-flex items-center gap-3 bg-black border-4 border-[#FEF9C3] px-7 py-4 rounded-xl font-black text-white"
                style={{ boxShadow: "6px 6px 0px #FEF9C3" }}
                onClick={() => console.log("Google Play clicked")}
              >
                <Smartphone className="h-6 w-6 text-white" aria-hidden="true" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-base">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Security Section ─────────────────────────────────────────── */}
        <section
          id="security"
          className="w-full py-24 px-4 md:px-6"
          aria-labelledby="security-heading"
        >
          <div className="max-w-5xl mx-auto">
            <div
              className="border-4 border-black rounded-xl p-10 bg-white"
              style={{ boxShadow: "8px 8px 0px #000" }}
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div
                    className="inline-flex items-center gap-2 bg-[#D1FAE5] border-3 border-black px-4 py-2 rounded-full font-black text-sm text-black mb-6"
                    style={{ borderWidth: "3px" }}
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Zero-Trust Security
                  </div>
                  <h2 id="security-heading" className="text-3xl font-black text-black mb-4">
                    BUILT FOR COMPLIANCE
                  </h2>
                  <p className="text-gray-600 font-semibold leading-relaxed">
                    Every API call is validated with a JWT Bearer token. Row-Level Security (RLS) enforces database access at the row level. Admins, vets, and customers only see their own data.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    "PostgreSQL Row Level Security (RLS)",
                    "JWT Zero-Trust API gateway",
                    "AES-256 encrypted at rest",
                    "WCAG 2.1 AA compliant",
                    "Sri Lanka Data Protection Act compliant",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 bg-[#D1FAE5] border-2 border-black px-4 py-3 rounded-lg"
                    >
                      <ShieldCheck className="h-4 w-4 text-green-700 flex-shrink-0" aria-hidden="true" />
                      <span className="font-bold text-sm text-black">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="w-full py-24 px-4 md:px-6 text-center bg-[#FFE4E6] border-t-4 border-black">
          <h2 className="text-4xl font-black text-black mb-6 max-w-2xl mx-auto">
            READY TO RUN A BETTER CLINIC?
          </h2>
          <p className="text-gray-700 font-semibold text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of clinics already using VetNary to streamline their operations.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-black text-lg text-white bg-[#818CF8] border-4 border-black px-10 py-5 rounded-xl hover:bg-[#6366F1] transition-transform active:translate-y-1 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
            style={{ boxShadow: "8px 8px 0px #000" }}
          >
            Register Your Clinic Free <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="w-full py-10 bg-black border-t-4 border-black" aria-label="Site footer">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#818CF8]" aria-hidden="true" />
            <span className="text-white font-black">VetNary System</span>
          </div>
          <p className="text-gray-400 font-semibold">© 2026 VetNary SL. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-gray-400 hover:text-white font-bold transition-colors focus:outline-none focus:underline">
              Clinic Portal
            </Link>
            <Link href="/register" className="text-gray-400 hover:text-white font-bold transition-colors focus:outline-none focus:underline">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
