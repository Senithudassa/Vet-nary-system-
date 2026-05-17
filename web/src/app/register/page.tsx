"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle,
  ChevronRight,
  User,
  Building2,
  Eye,
  EyeOff,
  CreditCard,
} from "lucide-react";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { authService } from "@/app/services/auth.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DoctorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  password: string;
  confirmPassword: string;
}

interface ClinicForm {
  clinicName: string;
  clinicAddress: string;
  operatingHours: string;
  clinicLatitude: number | null;
  clinicLongitude: number | null;
}

type OperatingDay = {
  key: string;
  label: string;
  enabled: boolean;
  open: string;
  close: string;
};

const weekDayOptions: Array<{ key: string; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "Doctor Info", icon: User },
    { num: 2, label: "Clinic Info", icon: Building2 },
    { num: 3, label: "Payment", icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-0">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.num;
        const isDone = currentStep > step.num;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full border-3 border-black flex items-center justify-center font-black text-sm transition-all
                                    ${isDone ? "bg-green-400 text-black" : isActive ? "bg-[#818CF8] text-white" : "bg-[#FAF9F6] text-gray-400"}`}
                style={{ borderWidth: "3px" }}
              >
                {isDone ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-wide ${isActive ? "text-[#818CF8]" : isDone ? "text-green-600" : "text-gray-400"}`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 mb-5 rounded-full border border-black ${isDone ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────
function Field({
  id,
  label,
  required = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-black text-black uppercase tracking-wide"
      >
        {label} {required && <span className="text-[#818CF8]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none focus:ring-3 focus:ring-[#818CF8] transition-shadow";
const inputStyle = { borderWidth: "3px" };

const buildOperatingHoursSummary = (days: OperatingDay[]) => {
  const active = days.filter((day) => day.enabled);
  if (!active.length) return "";
  return active
    .map((day) =>
      day.open && day.close
        ? `${day.label} ${day.open}–${day.close}`
        : `${day.label} (hours not set)`,
    )
    .join(", ");
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);
const REGISTRATION_FEE_CENTS = 5000;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const loadGoogleMapsScript = () =>
  new Promise<boolean>((resolve, reject) => {
    if (typeof window === "undefined") return resolve(false);

    const existing = document.querySelector('script[data-google-maps="true"]');
    if (existing) {
      if ((window as any).google?.maps) return resolve(true);
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps.")),
      );
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return reject(new Error("Google Maps API key is missing."));
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

// ─── Payment Form ─────────────────────────────────────────────────────────────
function PaymentForm({
  clientSecret,
  amountLabel,
  onPaid,
}: {
  clientSecret: string;
  amountLabel: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (!stripe || !elements) {
      return setPaymentError("Stripe is still loading. Please wait.");
    }
    if (!clientSecret) {
      return setPaymentError("Payment is not initialized yet.");
    }

    setIsPaying(true);
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsPaying(false);
      return setPaymentError("Card input is not ready.");
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: cardElement },
      },
    );

    if (error) {
      setIsPaying(false);
      return setPaymentError(
        error.message || "Payment failed. Please try again.",
      );
    }

    if (paymentIntent?.status === "succeeded") {
      onPaid();
    } else {
      setPaymentError("Payment was not completed. Please try again.");
    }

    setIsPaying(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentError && (
        <div
          role="alert"
          className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
        >
          {paymentError}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-black text-black uppercase tracking-wide">
          Card Details
        </label>
        <div
          className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] focus:outline-none transition-shadow"
          style={inputStyle}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#111827",
                  "::placeholder": { color: "#9CA3AF" },
                },
                invalid: { color: "#DC2626" },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPaying || !stripe || !elements}
        className="w-full bg-[#818CF8] text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
        style={{ boxShadow: "5px 5px 0px #000" }}
      >
        {isPaying ? "Processing…" : `Pay ${amountLabel}`}
      </button>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Doctor form
  const [doctor, setDoctor] = useState<DoctorForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Clinic form
  const [clinic, setClinic] = useState<ClinicForm>({
    clinicName: "",
    clinicAddress: "",
    operatingHours: "",
    clinicLatitude: null,
    clinicLongitude: null,
  });

  const [operatingDays, setOperatingDays] = useState<OperatingDay[]>(() =>
    weekDayOptions.map((day) => ({
      ...day,
      enabled: false,
      open: "09:00",
      close: "17:00",
    })),
  );

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const amountLabel = `$${(REGISTRATION_FEE_CENTS / 100).toFixed(2)}`;

  useEffect(() => {
    setClinic((prev) => ({
      ...prev,
      operatingHours: buildOperatingHoursSummary(operatingDays),
    }));
  }, [operatingDays]);

  useEffect(() => {
    if (step !== 2 || mapsReady) return;

    setMapsError("");
    loadGoogleMapsScript()
      .then(() => setMapsReady(true))
      .catch((err) =>
        setMapsError(
          err instanceof Error ? err.message : "Failed to load Google Maps.",
        ),
      );
  }, [step, mapsReady]);

  useEffect(() => {
    if (
      step !== 2 ||
      !mapsReady ||
      mapInstanceRef.current ||
      !mapContainerRef.current
    )
      return;

    const google = (window as any).google;
    if (!google?.maps) return;

    const hasLocation =
      clinic.clinicLatitude !== null && clinic.clinicLongitude !== null;
    const center = hasLocation
      ? {
          lat: clinic.clinicLatitude as number,
          lng: clinic.clinicLongitude as number,
        }
      : { lat: 0, lng: 0 };

    const map = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom: hasLocation ? 16 : 2,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    if (hasLocation) {
      markerRef.current = new google.maps.Marker({ position: center, map });
    }

    map.addListener("click", (e: any) => {
      if (!e?.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const location = { lat, lng };

      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({ position: location, map });
      } else {
        markerRef.current.setPosition(location);
      }

      setClinic((prev) => ({
        ...prev,
        clinicLatitude: lat,
        clinicLongitude: lng,
      }));

      if (geocoderRef.current) {
        geocoderRef.current.geocode(
          { location },
          (results: any, status: string) => {
            if (status === "OK" && results?.[0]?.formatted_address) {
              setClinic((prev) => ({
                ...prev,
                clinicLatitude: lat,
                clinicLongitude: lng,
                clinicAddress: results[0].formatted_address,
              }));
            }
          },
        );
      }
    });
  }, [step, mapsReady, clinic.clinicLatitude, clinic.clinicLongitude]);

  const initializePayment = async () => {
    setPaymentError("");

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return setPaymentError("Stripe publishable key is missing.");
    }

    setIsCreatingPayment(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: REGISTRATION_FEE_CENTS,
          currency: "usd",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize payment.");
      }

      const data = await res.json();
      if (!data?.clientSecret) {
        throw new Error("Missing client secret.");
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setPaymentError(
        err instanceof Error ? err.message : "Failed to initialize payment.",
      );
    } finally {
      setIsCreatingPayment(false);
    }
  };

  useEffect(() => {
    if (step === 3 && !clientSecret) {
      initializePayment();
    }
  }, [step, clientSecret]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    handleRegister(true);
  };

  const updateClinicLocation = (lat: number, lng: number, address?: string) =>
    setClinic((prev) => ({
      ...prev,
      clinicLatitude: lat,
      clinicLongitude: lng,
      clinicAddress: address ?? prev.clinicAddress,
    }));

  const handleUseMyLocation = () => {
    if (!mapsReady || !mapInstanceRef.current) {
      setMapsError("Map is not ready yet.");
      return;
    }
    if (!navigator.geolocation) {
      setMapsError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const google = (window as any).google;
        const map = mapInstanceRef.current;
        const location = { lat, lng };

        map.setCenter(location);
        map.setZoom(16);

        if (!markerRef.current) {
          markerRef.current = new google.maps.Marker({
            position: location,
            map,
          });
        } else {
          markerRef.current.setPosition(location);
        }

        updateClinicLocation(lat, lng);

        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location },
            (results: any, status: string) => {
              if (status === "OK" && results?.[0]?.formatted_address) {
                updateClinicLocation(lat, lng, results[0].formatted_address);
              }
            },
          );
        }
      },
      () => setMapsError("Unable to access your location."),
    );
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const setDoctorField =
    (field: keyof DoctorForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDoctor((prev) => ({ ...prev, [field]: e.target.value }));

  const setClinicField =
    (field: keyof ClinicForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setClinic((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleOperatingDay = (key: string) =>
    setOperatingDays((prev) =>
      prev.map((day) =>
        day.key === key ? { ...day, enabled: !day.enabled } : day,
      ),
    );

  const updateOperatingTime =
    (key: string, field: "open" | "close") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setOperatingDays((prev) =>
        prev.map((day) =>
          day.key === key ? { ...day, [field]: e.target.value } : day,
        ),
      );

  // ── Step 1 validation → go to step 2 ─────────────────────────────────────
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!doctor.firstName.trim() || !doctor.lastName.trim()) {
      return setError("Please enter your first and last name.");
    }
    if (!doctor.email.trim()) return setError("Email is required.");
    if (!doctor.phone.trim()) return setError("Phone number is required.");
    if (!doctor.licenseNumber.trim())
      return setError("License number is required.");
    if (doctor.password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (doctor.password !== doctor.confirmPassword)
      return setError("Passwords do not match.");

    setStep(2);
  };

  // ── Step 2 validation → go to step 3 ─────────────────────────────────────
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clinic.clinicName.trim()) return setError("Clinic name is required.");
    if (!clinic.clinicAddress.trim())
      return setError("Clinic address is required.");
    if (clinic.clinicLatitude === null || clinic.clinicLongitude === null) {
      return setError("Please pick the clinic location on the map.");
    }

    const enabledDays = operatingDays.filter((day) => day.enabled);
    if (!enabledDays.length) {
      return setError("Please select at least one operating day.");
    }

    const missingTime = enabledDays.find((day) => !day.open || !day.close);
    if (missingTime) {
      return setError(
        `Please set opening and closing time for ${missingTime.label}.`,
      );
    }

    const invalidTime = enabledDays.find((day) => day.open >= day.close);
    if (invalidTime) {
      return setError(
        `Closing time must be after opening time on ${invalidTime.label}.`,
      );
    }

    setStep(3);
  };

  // ── Final submit after payment ───────────────────────────────────────────
  const handleRegister = async (paid?: boolean) => {
    setError("");

    if (!paid && !paymentComplete)
      return setError("Please complete payment before registering.");
    if (!clinic.clinicName.trim()) return setError("Clinic name is required.");
    if (!clinic.clinicAddress.trim())
      return setError("Clinic address is required.");
    if (clinic.clinicLatitude === null || clinic.clinicLongitude === null) {
      return setError("Please pick the clinic location on the map.");
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Register the doctor
      const doctorData = await authService.registerDoctor({
        email: doctor.email,
        password: doctor.password,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        phone: doctor.phone,
        licenseNumber: doctor.licenseNumber,
      });

      // 2️⃣ Register the clinic, linked to the new doctor
      const clinicPayload = {
        ownerId: doctorData.id,
        clinicName: clinic.clinicName,
        clinicAddress: clinic.clinicAddress,
        operatingHours: clinic.operatingHours || undefined,
        latitude: clinic.clinicLatitude,
        longitude: clinic.clinicLongitude,
      };

      await authService.registerClinic(clinicPayload);

      // 🎉 Both succeeded
      setSuccess(true);
      setTimeout(() => router.push("/login?registered=true"), 2500);
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to register. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#FAF9F6]">
        <div
          className="bg-white border-4 border-black rounded-xl p-10 text-center max-w-sm w-full"
          style={{ boxShadow: "8px 8px 0px #000" }}
        >
          <CheckCircle
            className="h-14 w-14 text-green-500 mx-auto mb-4"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-black text-black mb-3">
            Application Submitted!
          </h1>
          <p className="text-gray-600 font-semibold mb-6">
            Your clinic account has been created. A Main Admin will review and
            approve your branch. Redirecting you to sign in…
          </p>
          <div className="h-2 bg-[#FAF9F6] border-2 border-black rounded-full overflow-hidden">
            <div
              className="h-full bg-[#818CF8] animate-[grow_2.5s_linear_forwards]"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────
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
        className="w-full max-w-lg bg-white border-4 border-black rounded-xl overflow-hidden"
        style={{ boxShadow: "8px 8px 0px #000" }}
      >
        {/* Card Header */}
        <div className="bg-[#818CF8] px-8 pt-6 pb-5 border-b-4 border-black">
          <h1 className="text-2xl font-black text-white">
            REGISTER YOUR CLINIC
          </h1>
          <p className="text-blue-200 font-semibold mt-1 text-sm">
            A Main Admin will review and approve your branch.
          </p>
          {/* Step indicator inside header */}
          <div className="mt-5">
            <StepIndicator currentStep={step} />
          </div>
        </div>

        {/* ── STEP 1: Doctor Info ─────────────────────────────────── */}
        {step === 1 && (
          <form
            onSubmit={handleStep1Next}
            noValidate
            aria-label="Doctor registration form"
          >
            <div className="px-8 py-6 space-y-5">
              {/* Step label */}
              <div className="flex items-center gap-2 pb-1 border-b-2 border-black">
                <User className="w-4 h-4 text-[#818CF8]" />
                <span className="text-sm font-black uppercase tracking-wide text-black">
                  Step 1 — Doctor Details
                </span>
              </div>

              {/* Error Banner */}
              {error && (
                <div
                  role="alert"
                  className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                >
                  {error}
                </div>
              )}

              {/* Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="firstName" label="First Name" required>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    required
                    autoComplete="given-name"
                    value={doctor.firstName}
                    onChange={setDoctorField("firstName")}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field id="lastName" label="Last Name" required>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Silva"
                    required
                    autoComplete="family-name"
                    value={doctor.lastName}
                    onChange={setDoctorField("lastName")}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Email + Phone row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="regEmail" label="Work Email" required>
                  <input
                    id="regEmail"
                    type="email"
                    placeholder="vet@example.com"
                    required
                    autoComplete="email"
                    value={doctor.email}
                    onChange={setDoctorField("email")}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field id="phone" label="Contact Number" required>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="07X XXX XXXX"
                    required
                    autoComplete="tel"
                    value={doctor.phone}
                    onChange={setDoctorField("phone")}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* License Number */}
              <Field
                id="licenseNumber"
                label="Veterinary License Number"
                required
              >
                <input
                  id="licenseNumber"
                  type="text"
                  placeholder="e.g. VET-12345"
                  required
                  value={doctor.licenseNumber}
                  onChange={setDoctorField("licenseNumber")}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              {/* Password */}
              <Field id="regPassword" label="Create Password" required>
                <div className="relative">
                  <input
                    id="regPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={doctor.password}
                    onChange={setDoctorField("password")}
                    className={`${inputCls} pr-12`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Minimum 8 characters, securely hashed.
                </p>
              </Field>

              {/* Confirm Password */}
              <Field id="confirmPassword" label="Confirm Password" required>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                    value={doctor.confirmPassword}
                    onChange={setDoctorField("confirmPassword")}
                    className={`${inputCls} pr-12`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 space-y-4">
              <button
                type="submit"
                className="w-full bg-[#818CF8] text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8] flex items-center justify-center gap-2"
                style={{ boxShadow: "5px 5px 0px #000" }}
              >
                Next — Payment <ChevronRight className="w-5 h-5" />
              </button>

              <p className="text-center text-sm font-semibold text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#818CF8] font-black underline hover:no-underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* ── STEP 2: Clinic Info ─────────────────────────────────── */}
        {step === 2 && (
          <form
            onSubmit={handleStep2Next}
            noValidate
            aria-label="Clinic registration form"
          >
            <div className="px-8 py-6 space-y-5">
              {/* Step label */}
              <div className="flex items-center gap-2 pb-1 border-b-2 border-black">
                <Building2 className="w-4 h-4 text-[#818CF8]" />
                <span className="text-sm font-black uppercase tracking-wide text-black">
                  Step 2 — Clinic Details
                </span>
              </div>

              {/* Summary of doctor entered */}
              <div className="bg-[#FAF9F6] border-2 border-black rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 flex items-start gap-2">
                <User className="w-4 h-4 text-[#818CF8] mt-0.5 shrink-0" />
                <span>
                  Doctor:{" "}
                  <span className="font-black text-black">
                    {doctor.firstName} {doctor.lastName}
                  </span>
                  {" · "}
                  <span className="text-[#818CF8]">{doctor.email}</span>
                </span>
              </div>

              {/* Error Banner */}
              {error && (
                <div
                  role="alert"
                  className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                >
                  {error}
                </div>
              )}

              {/* Clinic Name */}
              <Field id="clinicName" label="Clinic Name" required>
                <input
                  id="clinicName"
                  type="text"
                  placeholder="e.g. Happy Paws Clinic"
                  required
                  value={clinic.clinicName}
                  onChange={setClinicField("clinicName")}
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>

              {/* Address */}
              <Field id="clinicAddress" label="Clinic Address" required>
                <textarea
                  id="clinicAddress"
                  placeholder="Full physical address (used on the mobile app map)"
                  required
                  rows={2}
                  value={clinic.clinicAddress}
                  onChange={setClinicField("clinicAddress")}
                  className="w-full border-black rounded-md px-4 py-3 text-sm font-semibold bg-[#FAF9F6] resize-none focus:outline-none focus:ring-3 focus:ring-[#818CF8] transition-shadow"
                  style={inputStyle}
                />
              </Field>

              {/* Location Picker */}
              <Field
                id="clinicLocation"
                label="Clinic Location (Pick on Map)"
                required
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Click on the map to drop a pin. The address and coordinates
                    will auto-fill.
                  </p>
                  <div
                    className="h-64 w-full border-black rounded-md overflow-hidden bg-[#FAF9F6]"
                    style={{ borderWidth: "3px" }}
                  >
                    {mapsError ? (
                      <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-red-600 bg-red-50">
                        {mapsError}
                      </div>
                    ) : (
                      <div ref={mapContainerRef} className="h-full w-full" />
                    )}
                  </div>
                  {!mapsError && !mapsReady && (
                    <p className="text-xs font-semibold text-gray-500">
                      Loading map…
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#FAF9F6] border-2 border-black rounded-md px-3 py-2 text-xs font-semibold text-gray-700">
                      <span className="font-black text-black">Latitude: </span>
                      {clinic.clinicLatitude !== null
                        ? clinic.clinicLatitude.toFixed(6)
                        : "Not set"}
                    </div>
                    <div className="bg-[#FAF9F6] border-2 border-black rounded-md px-3 py-2 text-xs font-semibold text-gray-700">
                      <span className="font-black text-black">Longitude: </span>
                      {clinic.clinicLongitude !== null
                        ? clinic.clinicLongitude.toFixed(6)
                        : "Not set"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={!mapsReady}
                    className="w-full bg-white text-black font-black text-sm py-3 border-3 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-40 focus:outline-none"
                    style={{
                      borderWidth: "3px",
                      boxShadow: "3px 3px 0px #000",
                    }}
                  >
                    Use my current location
                  </button>
                </div>
              </Field>

              {/* Operating Hours */}
              <Field id="operatingHours" label="Operating Hours">
                <div className="space-y-3">
                  <input
                    id="operatingHours"
                    type="hidden"
                    value={clinic.operatingHours}
                    readOnly
                  />
                  <div className="space-y-2">
                    {operatingDays.map((day) => (
                      <div key={day.key} className="flex items-center gap-3">
                        <label className="flex items-center gap-2 min-w-[90px]">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={() => toggleOperatingDay(day.key)}
                            className="h-4 w-4 border-2 border-black rounded"
                          />
                          <span className="text-sm font-black text-black">
                            {day.label}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={day.open}
                            onChange={updateOperatingTime(day.key, "open")}
                            disabled={!day.enabled}
                            className={`${inputCls} w-[130px] py-2 px-3 ${!day.enabled ? "opacity-60" : ""}`}
                            style={inputStyle}
                          />
                          <span className="font-black text-gray-500">–</span>
                          <input
                            type="time"
                            value={day.close}
                            onChange={updateOperatingTime(day.key, "close")}
                            disabled={!day.enabled}
                            className={`${inputCls} w-[130px] py-2 px-3 ${!day.enabled ? "opacity-60" : ""}`}
                            style={inputStyle}
                          />
                        </div>
                        {!day.enabled && (
                          <span className="text-xs font-semibold text-gray-500">
                            Closed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#FAF9F6] border-2 border-black rounded-md px-3 py-2 text-xs font-semibold text-gray-700">
                    <span className="font-black text-black">Summary: </span>
                    {clinic.operatingHours || "No operating hours selected."}
                  </div>
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 space-y-3">
              <button
                type="submit"
                className="w-full bg-[#818CF8] text-white font-black text-base py-4 border-4 border-black rounded-lg transition-transform active:translate-y-1 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-[#818CF8]"
                style={{ boxShadow: "5px 5px 0px #000" }}
              >
                Next — Payment
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="w-full bg-white text-black font-black text-sm py-3 border-3 border-black rounded-lg transition-transform active:translate-y-1 focus:outline-none"
                style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
              >
                ← Back to Doctor Details
              </button>

              <p className="text-center text-sm font-semibold text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#818CF8] font-black underline hover:no-underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* ── STEP 3: Payment ─────────────────────────────────────── */}
        {step === 3 && (
          <div className="px-8 py-6 space-y-5">
            {/* Step label */}
            <div className="flex items-center gap-2 pb-1 border-b-2 border-black">
              <CreditCard className="w-4 h-4 text-[#818CF8]" />
              <span className="text-sm font-black uppercase tracking-wide text-black">
                Step 3 — Payment
              </span>
            </div>

            {/* Summary of doctor entered */}
            <div className="bg-[#FAF9F6] border-2 border-black rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 flex items-start gap-2">
              <User className="w-4 h-4 text-[#818CF8] mt-0.5 shrink-0" />
              <span>
                Doctor:{" "}
                <span className="font-black text-black">
                  {doctor.firstName} {doctor.lastName}
                </span>
                {" · "}
                <span className="text-[#818CF8]">{doctor.email}</span>
              </span>
            </div>

            <div className="bg-white border-2 border-black rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>Billing Email</span>
              <span className="font-black text-black">{doctor.email}</span>
            </div>

            <div className="bg-white border-2 border-black rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>Registration Fee</span>
              <span className="font-black text-black">{amountLabel}</span>
            </div>

            {paymentComplete ? (
              <div className="bg-green-50 border-2 border-green-700 text-green-800 text-sm p-4 rounded-md font-semibold space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-black">Payment successful</span>
                </div>
                <p className="text-green-700">
                  Finalizing your registration now…
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    role="alert"
                    className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                  >
                    {error}
                  </div>
                )}

                {paymentError && (
                  <div
                    role="alert"
                    className="bg-red-100 border-2 border-red-600 text-red-700 text-sm p-3 rounded-md font-semibold"
                  >
                    {paymentError}
                  </div>
                )}

                {!clientSecret && (
                  <button
                    type="button"
                    onClick={initializePayment}
                    disabled={isCreatingPayment}
                    className="w-full bg-white text-black font-black text-sm py-3 border-3 border-black rounded-lg transition-transform active:translate-y-1 disabled:opacity-40 focus:outline-none"
                    style={{
                      borderWidth: "3px",
                      boxShadow: "3px 3px 0px #000",
                    }}
                  >
                    {isCreatingPayment
                      ? "Initializing payment…"
                      : "Initialize Payment"}
                  </button>
                )}

                {clientSecret && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      amountLabel={amountLabel}
                      onPaid={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setStep(2);
                setError("");
              }}
              className="w-full bg-white text-black font-black text-sm py-3 border-3 border-black rounded-lg transition-transform active:translate-y-1 focus:outline-none"
              style={{ borderWidth: "3px", boxShadow: "3px 3px 0px #000" }}
            >
              ← Back to Clinic Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
