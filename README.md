# VetNary System

A veterinary ecosystem for Sri Lanka — turning the traditional physical vet book into a secure, AI‑powered digital platform. The system connects **clinics** and **pet owners** through a shared platform with web and mobile clients backed by a NestJS API and PostgreSQL (Prisma).

---

## Table of Contents

- [Roles & Access Hierarchy](#roles--access-hierarchy)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Backend (NestJS)](#backend-nestjs)
- [Web Frontend (Next.js)](#web-frontend-nextjs)
- [Mobile App (Expo / React Native)](#mobile-app-expo--react-native)
- [ML — Skin Disease Classifier (MobileNetV2)](#ml--skin-disease-classifier-mobilenetv2)
- [Database Schema (PostgreSQL / Prisma)](#database-schema-postgresql--prisma)
- [Authentication & Security Flow](#authentication--security-flow)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)

---

## Roles & Access Hierarchy

| Role         | Platform | Description |
|--------------|----------|-------------|
| `MAIN_ADMIN` | Web      | Full system control: approvals, staff management, oversight |
| `MINOR_ADMIN`| Web      | Support, ticket routing, operational assistance |
| `VET`        | Web      | Clinic operations, appointments, vetbook entries |
| `CUSTOMER`   | Mobile   | Pet management, appointments, VetBook access, AI features |

---

## Tech Stack

| Layer            | Technology |
|------------------|------------|
| Web Frontend     | Next.js 16, React 19, TailwindCSS, shadcn/ui |
| Mobile App       | Expo (React Native), Expo Router |
| Backend API      | NestJS (Node.js, TypeScript) |
| Database         | PostgreSQL with Prisma ORM |
| Auth             | JWT (NestJS Passport/JWT) |
| AI               | Google Gemini via `@google/genai` |
| ML Training      | PyTorch (MobileNetV2 Transfer Learning) — Google Colab |

---

## Project Structure

```
VetNary-System/
├── vetnary-api/                # NestJS backend
│   ├── src/
│   │   ├── auth/               # JWT auth, login, registration
│   │   ├── users/              # User management
│   │   ├── clinics/            # Clinic operations
│   │   ├── pets/               # Pet management
│   │   ├── vetbook/            # Medical records & vaccinations
│   │   ├── appointments/       # Appointment booking
│   │   ├── invoices/           # Billing
│   │   ├── tickets/            # Support tickets
│   │   ├── ai/                 # Gemini AI endpoints
│   │   ├── prisma/             # Prisma service
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema
│   │   └── migrations/         # Migration history
│   └── README.md
│
├── web/                         # Next.js admin/clinic dashboard
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   │   ├── (dashboard)/     # Protected dashboards
│   │   │   ├── login/           # Login
│   │   │   ├── register/        # Clinic registration + payment
│   │   │   └── api/stripe/      # Stripe payment intent
│   │   ├── components/          # UI components
│   │   ├── context/             # Auth context (JWT session)
│   │   └── lib/                 # Utilities & types
│   └── README.md
│
├── mobile/                      # Expo / React Native customer app
│   ├── app/                     # Expo Router screens
│   ├── context/                 # Auth context
│   ├── hooks/                   # Data hooks (pets, vetbook, tickets, etc.)
│   ├── lib/                     # API client
│   └── README.md
│
├── ml/                          # ML training scripts
│   └── vet_skin_classifier.py   # MobileNetV2 transfer learning
│
└── README.md                    # ← You are here
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Web Dashboard                         │
│      Next.js (Admin / Vet Portal / Clinic Registration)      │
└───────────────┬──────────────────────────────────────────────┘
                │ JWT (Bearer)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                         NestJS API                           │
│  Auth · Clinics · Pets · VetBook · Appointments · AI · etc.  │
└───────────────┬──────────────────────────────────────────────┘
                │ Prisma
                ▼
┌──────────────────────────────────────────────────────────────┐
│                   PostgreSQL (Prisma ORM)                    │
└──────────────────────────────────────────────────────────────┘
                ▲
                │ JWT (Bearer)
┌───────────────┴──────────────────────────────────────────────┐
│                        Mobile App                            │
│                   Expo / React Native                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Backend (NestJS)

### `src/main.ts` — Application Entry Point

- Enables CORS for allowed frontends via `FRONTEND_URLS`
- Global prefix: `/api/v1`
- Global validation pipe
- Swagger docs served at `/api/docs`

### `src/auth` — Authentication

- `POST /auth/register/customer` — Customer registration  
- `POST /auth/register/doctor` — Vet registration  
- `POST /auth/register/clinic` — Clinic registration (owner must be Vet)  
- `POST /auth/login` — General login  
- `POST /auth/login/clinic` — Clinic owner login  
- `POST /auth/login/admin` — Admin login  
- `POST /auth/refresh` — Token refresh  
- `GET /auth/me` — Current user profile (JWT required)

**JWT-based**, with roles enforced via guards.

### `src/ai` — AI Services (Gemini)

- `POST /ai/scan-skin` — Uploads an image, returns diagnosis + bounding box  
- `POST /ai/chat` — Veterinary-only chat assistant  

Uses `@google/genai` with `GEMINI_API_KEY`.

---

## Web Frontend (Next.js)

- Uses the NestJS API (`NEXT_PUBLIC_API_URL`) for auth, clinic data, and admin features.
- Stores session tokens in `localStorage` (`vetnary_session`).
- Clinic registration includes Stripe payment flow.
- Google Maps is used for clinic location preview.

Key files:
- `src/context/AuthContext.tsx` — JWT session management
- `src/app/register/page.tsx` — Registration + Stripe + Google Maps
- `src/app/api/stripe/create-payment-intent/route.ts` — Stripe payment intent

---

## Mobile App (Expo / React Native)

- Uses a custom API client in `mobile/lib/api.ts`.
- Auth is JWT-based; tokens stored in `AsyncStorage`.
- Screens and tabs include:
  - Pets
  - VetBook
  - Clinics
  - Appointments
  - Tickets
  - Profile
  - AI Scanner / Chat (API-backed)

**Note:** API base URL is currently defined in `mobile/lib/api.ts`. Update it to match your backend host.

---

## ML — Skin Disease Classifier (MobileNetV2)

The `ml/` directory contains a Google Colab–ready PyTorch script that fine-tunes **MobileNetV2** via transfer learning to classify veterinary skin images into three categories:

| Class | Description |
|---|---|
| `Healthy_Dermis` | Normal, healthy skin |
| `Mange` | Demodicosis / sarcoptic mange |
| `Ringworm` | Dermatophytosis (fungal) |

The script uses Kaggle’s dataset and outputs a `.pt` checkpoint and training curves.

---

## Database Schema (PostgreSQL / Prisma)

Core entities:

- `users`
- `clinics`
- `clinic_staff`
- `pets`
- `appointments`
- `medical_records`
- `vaccinations`
- `invoices`
- `support_tickets`
- `prescriptions`

See `vetnary-api/prisma/schema.prisma` for the full schema.

---

## Authentication & Security Flow

### Login Flow (JWT)

```
1. User submits email/password → /auth/login (or /login/admin or /login/clinic)
2. API validates credentials
3. Returns access_token + refresh_token
4. Client stores token and attaches Authorization: Bearer <token> to requests
5. Protected endpoints validate JWT via NestJS guards
```

---

## Environment Variables

### Backend (`vetnary-api/.env`)
```
PORT=3001
FRONTEND_URLS=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/vetnary
JWT_SECRET=your-secret
GEMINI_API_KEY=your-gemini-api-key
```

### Web (`web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Mobile
The mobile app reads the API base URL from `mobile/lib/api.ts`. Update `BASE_URL` to point at your backend.

---

## Setup Instructions

### Backend (NestJS)
```
cd vetnary-api
npm install
# Configure .env
npm run start:dev
```

### Web
```
cd web
npm install
# Configure .env.local
npm run dev
```

### Mobile
```
cd mobile
npm install
# Update BASE_URL in lib/api.ts
npx expo start
```

### Database (Prisma)
```
cd vetnary-api
npx prisma migrate dev
npx prisma generate
```

---

## License

© 2026 VetNary SL. All rights reserved.