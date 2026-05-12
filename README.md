# VetNary System

A veterinary ecosystem for Sri Lanka — turning the traditional physical vet book into a secure, AI-powered digital platform. Modeled on the Uber two-sided marketplace concept: **clinics** (supply) and **pet owners** (demand) connected through a shared platform.

---

## Table of Contents

- [Roles & Access Hierarchy](#roles--access-hierarchy)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Backend (FastAPI)](#backend-fastapi)
- [Web Frontend (Next.js)](#web-frontend-nextjs)
- [Mobile App (Expo / React Native)](#mobile-app-expo--react-native)
- [Database Schema (Supabase / PostgreSQL)](#database-schema-supabase--postgresql)
- [Authentication & Security Flow](#authentication--security-flow)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)

---

## Roles & Access Hierarchy

| Role           | Platform   | Description                                                        |
|----------------|------------|--------------------------------------------------------------------|
| `main_admin`   | Web        | Full system control: deploy authorization, impersonation, user management |
| `minor_admin`  | Web        | Customer support, ticket routing, config proposals                 |
| `vet`          | Web        | Independent branch management, financials, patient records         |
| `customer`     | Mobile     | Pet management, VetBook, clinic discovery, AI skin scanner, chatbot |

---

## Tech Stack

| Layer            | Technology                                |
|------------------|-------------------------------------------|
| Web Frontend     | Next.js 16, React, shadcn/ui, TailwindCSS |
| Mobile App       | React Native (Expo Router), Neobrutalism UI |
| Backend API      | Python (FastAPI)                          |
| Database & Auth  | Supabase (PostgreSQL + Auth + RLS)        |
| AI               | TensorFlow (Skin Checker) & Google Gemini (Chatbot) |
| ML Training      | PyTorch (MobileNetV2 Transfer Learning) — Google Colab |

---

## Project Structure

```
Vetnary-System/
├── backend/                    # Python FastAPI server
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point, middleware registration
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic settings (env vars)
│   │   │   ├── security.py     # Zero Trust middleware & AI rate limiter
│   │   │   ├── logging.py      # PII-safe structured JSON logger
│   │   │   └── supabase_admin.py  # Service-role Supabase client
│   │   └── api/v1/
│   │       └── roles.py        # Role assignment endpoints
│   ├── docs/
│   │   ├── supabase_schema.sql          # Full database schema + RLS
│   │   ├── schema_patch_phase1.sql      # Phase 1 security patches
│   │   ├── schema_patch_v1.1.sql        # Incremental schema updates
│   │   └── schema_patch_v1.2_rls_hotfix.sql  # Registration RLS fix
│   ├── Test/
│   │   ├── test_supabase.py    # Supabase connectivity test
│   │   ├── test_pg.py          # Direct PostgreSQL test
│   │   └── test_security.py    # Middleware security tests
│   ├── .env                    # Backend environment variables
│   └── requirements.txt        # Python dependencies
│
├── web/                        # Next.js clinic/admin dashboard
│   └── src/
│       ├── app/
│       │   ├── layout.tsx      # Root layout, metadata, AuthProvider
│       │   ├── page.tsx        # Landing page (public)
│       │   ├── login/page.tsx  # Login form
│       │   ├── register/page.tsx  # Clinic registration form
│       │   └── (dashboard)/
│       │       ├── layout.tsx     # Protected dashboard shell + sidebar
│       │       ├── main-admin/page.tsx  # Main Admin dashboard
│       │       ├── minor-admin/page.tsx # Minor Admin dashboard
│       │       ├── vet/page.tsx         # Vet branch dashboard
│       │       └── assistant/page.tsx   # Vet Assistant till
│       ├── components/
│       │   ├── app-sidebar.tsx    # Role-filtered navigation sidebar
│       │   └── ui/                # shadcn/ui component library
│       │       ├── protected-route.tsx  # RBAC route guard
│       │       ├── sidebar.tsx, button.tsx, card.tsx, table.tsx, ...
│       │       └── loader/full-page-loader.tsx
│       ├── context/
│       │   └── AuthContext.tsx  # Supabase auth state + role management
│       ├── hooks/
│       │   └── use-mobile.ts   # Mobile breakpoint detection
│       └── lib/
│           └── supabase/config.ts  # Supabase browser client
│
├── mobile/                     # Expo / React Native customer app
│   ├── app/
│   │   ├── _layout.tsx         # Root layout, AuthProvider, auth routing
│   │   ├── login.tsx           # Mobile login screen
│   │   ├── register.tsx        # Mobile registration screen
│   │   ├── modal.tsx           # Generic modal screen
│   │   └── (tabs)/
│   │       ├── _layout.tsx     # Tab navigator configuration
│   │       ├── index.tsx       # Pets tab (home screen)
│   │       ├── vetbook.tsx     # VetBook timeline tab
│   │       ├── discover.tsx    # Clinic discovery / map tab
│   │       ├── ai-checker.tsx  # AI skin scanner tab
│   │       └── chatbot.tsx     # AI chatbot tab
│   ├── context/
│   │   └── AuthContext.tsx     # Mobile auth state + profile management
│   ├── hooks/
│   │   └── usePets.ts         # CRUD hook for pet data
│   ├── lib/
│   │   └── supabase.ts        # Supabase client + TypeScript type exports
│   ├── components/             # Shared RN components
│   └── .env                    # Mobile environment variables
│
├── ml/                         # Machine learning training scripts
│   └── vet_skin_classifier.py  # MobileNetV2 transfer learning (Colab)
│
└── README.md                   # ← You are here
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE CLOUD                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Auth     │  │ Database │  │    RLS     │  │  Storage  │  │
│  │ (JWT)    │  │ (Postgres)│  │ (Policies) │  │  (Files)  │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───────────┘  │
└───────┼──────────────┼──────────────┼───────────────────────┘
        │              │              │
   ┌────┴──────────────┴──────────────┴────┐
   │          Supabase JS Client           │
   └──┬────────────────────────────────┬───┘
      │                                │
┌─────┴──────┐                  ┌──────┴──────┐
│  Web App   │                  │ Mobile App  │
│ (Next.js)  │                  │   (Expo)    │
│            │                  │             │
│ Dashboard  │                  │ Pets/VetBook│
│ Login/Reg  │                  │ Discover    │
│ Sidebar    │                  │ AI Scanner  │
│ Protected  │                  │ Chatbot     │
│ Routes     │                  │ Login/Reg   │
└─────┬──────┘                  └─────────────┘
      │
      │  Bearer JWT Token
      ▼
┌──────────────┐
│ FastAPI      │
│ Backend      │
│              │
│ Zero Trust   │
│ Middleware   │
│ AI Rate Limit│
│ Role Assign  │
└──────┬───────┘
       │ Service Role Key
       ▼
   Supabase Admin API
```

---

## Backend (FastAPI)

### `app/main.py` — Application Entry Point

| Symbol               | Type     | Description |
|----------------------|----------|-------------|
| `app`                | Instance | FastAPI application with CORS, two middlewares, and one API router |
| `read_root()`        | `GET /`  | Returns welcome message |
| `health_check()`     | `GET /health` | Returns `{"status": "ok"}` — excluded from auth middleware |

**Relationships:**
- Imports `zero_trust_auth_middleware` and `ai_quota_middleware` from `core/security.py`
- Imports `logger` from `core/logging.py`
- Includes the `roles.router` at prefix `/api/v1/auth`

---

### `app/core/config.py` — Environment Configuration

| Symbol    | Type       | Description |
|-----------|------------|-------------|
| `Settings`| Class      | Pydantic `BaseSettings` model that auto-loads from `.env` |
| `settings`| Instance   | Global singleton used by all other modules |

**Key Fields:** `ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_MODEL_API_KEY`, `AI_RATE_LIMIT_PER_MIN`

**Relationships:**
- Consumed by `supabase_admin.py` (for Supabase client init)
- Consumed by `security.py` (for environment check on mock token)

---

### `app/core/security.py` — Zero Trust Middleware & Rate Limiter

| Symbol                          | Type       | Description |
|---------------------------------|------------|-------------|
| `zero_trust_auth_middleware()`  | Middleware | Intercepts every request, validates JWT via `supabase_admin.auth.get_user(token)`, sets `request.state.user` |
| `ai_quota_middleware()`         | Middleware | Rate-limits `/api/v1/ai/*` endpoints using a fixed-window token bucket |
| `check_ai_rate_limit(client_id)`| Function   | Returns `True` if the client has remaining tokens in this window |
| `ai_rate_limits`                | Dict       | In-memory rate limit store (client_id → {tokens, last_refill}) |

**Relationships:**
- `zero_trust_auth_middleware` → imports `supabase_admin` from `supabase_admin.py` and `settings` from `config.py`
- `ai_quota_middleware` → reads `request.state.user.uid` (set by the Zero Trust layer)
- Both use `logger` from `logging.py`

---

### `app/core/logging.py` — PII-Safe Structured Logger

| Symbol                   | Type       | Description |
|--------------------------|------------|-------------|
| `PII_PATTERNS`           | Dict       | Regex patterns for emails, phones, SSNs |
| `PIIStrippingFormatter`  | Class      | Custom `logging.Formatter` that outputs JSON and masks PII |
| `recursive_mask(item)`   | Function   | Recursively masks PII in strings, dicts, and lists |
| `setup_secure_logger()`  | Function   | Creates a named logger with file + stream handlers |
| `logger`                 | Instance   | Global logger used across the entire backend |

**Relationships:**
- Used by `security.py`, `roles.py`, and `main.py` for all log output
- Writes to `secure_logs/app.log` and stdout

---

### `app/core/supabase_admin.py` — Supabase Admin Client

| Symbol            | Type     | Description |
|-------------------|----------|-------------|
| `supabase_admin`  | Instance | `Client` initialized with `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS |

**Relationships:**
- Reads `settings.SUPABASE_URL` and `settings.SUPABASE_SERVICE_ROLE_KEY` from `config.py`
- Used by `security.py` for JWT verification (`auth.get_user`)
- Used by `roles.py` for admin-level user updates (`auth.admin.update_user_by_id`)

---

### `app/api/v1/roles.py` — Role Assignment API

| Symbol                         | Type          | Description |
|--------------------------------|---------------|-------------|
| `RoleAssignmentRequest`        | Pydantic Model | Schema: `{uid: str, role: str}` |
| `assign_custom_role()`         | `POST /assign-role` | Sets `app_metadata.role` on a target user. Requires `main_admin` role |
| `get_my_role()`                | `GET /my-role`  | Returns the decoded token from middleware (`request.state.user`) |

**Relationships:**
- Protected by `zero_trust_auth_middleware` (checks `request.state.user.role`)
- Uses `supabase_admin` to write custom claims via the Admin API
- Uses `logger` for security audit events

---

## Web Frontend (Next.js)

### `lib/supabase/config.ts` — Supabase Browser Client

Creates the Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This client respects RLS policies (unlike the backend admin client).

**Relationships:**
- Imported by `AuthContext.tsx`, `app-sidebar.tsx`, `login/page.tsx`, and `register/page.tsx`

---

### `context/AuthContext.tsx` — Authentication State Manager

| Symbol                  | Type     | Description |
|-------------------------|----------|-------------|
| `AuthContextType`       | Type     | `{user, role, loading, getToken, signIn, signOut}` |
| `fetchRoleFromProfile()`| Function | Queries `profiles.role` for a given user ID |
| `AuthProvider`          | Component| Wraps the app, manages session lifecycle via `onAuthStateChange` |
| `syncSession()`         | Callback | Called on every auth event — sets user, fetches role from profiles |
| `signIn()`              | Function | `signInWithPassword()` with friendly error messages |
| `signOut()`             | Function | Calls `supabase.auth.signOut()` |
| `getToken()`            | Function | Returns the current JWT access token for API calls |
| `useAuth()`             | Hook     | Context consumer shortcut |

**Relationships:**
- `syncSession` → calls `fetchRoleFromProfile` → queries Supabase `profiles` table
- `getToken` → used by API call layers to attach `Authorization: Bearer` header
- Consumed by `ProtectedRoute`, `AppSidebar`, and all dashboard/auth pages

---

### `components/ui/protected-route.tsx` — Role-Based Route Guard

| Symbol            | Type      | Description |
|-------------------|-----------|-------------|
| `ProtectedRoute`  | Component | Checks `useAuth()` state against `allowedRoles` prop, redirects unauthorized users |

**Logic:**
1. No user → redirect to `/login`
2. User has role not in `allowedRoles` → redirect to their home dashboard
3. User exists but no role (limbo state) → redirect to `/`
4. Loading → shows `FullPageLoader`

**Relationships:**
- Used by `(dashboard)/layout.tsx` with `allowedRoles={["vet", "minor_admin", "main_admin"]}`
- Depends on `useAuth()` from `AuthContext.tsx`

---

### `components/app-sidebar.tsx` — Role-Filtered Navigation

| Symbol         | Type      | Description |
|----------------|-----------|-------------|
| `allItems`     | Array     | Master list of all routes with `requiredRoles` per item |
| `AppSidebar`   | Component | Filters `allItems` based on `useAuth().role`, renders sidebar links |
| `handleLogout` | Function  | Signs out via `supabase.auth.signOut()` |

**Route Visibility Matrix:**

| Route              | main_admin | minor_admin | vet |
|--------------------|:----------:|:-----------:|:---:|
| Main Admin Dashboard | ✅ | ❌ | ❌ |
| Minor Admin Panel   | ✅ | ✅ | ❌ |
| Vet Portal          | ✅ | ❌ | ✅ |
| Assistant Till      | ✅ | ❌ | ✅ |
| Patient Records     | ✅ | ❌ | ✅ |
| User Management     | ✅ | ❌ | ❌ |

---

### Dashboard Pages

| Page                          | File                              | Description |
|-------------------------------|-----------------------------------|-------------|
| Landing Page                  | `app/page.tsx`                    | Public marketing page with hero, features, stats, mobile CTA, security section |
| Login                         | `app/login/page.tsx`              | Email/password form → `useAuth().signIn()` → role-based redirect |
| Register                      | `app/register/page.tsx`           | Multi-step: creates auth user → inserts clinic → links via `clinic_staff` |
| Main Admin Dashboard          | `app/(dashboard)/main-admin/page.tsx` | Clinic monitoring, deploy authorization, impersonation |
| Minor Admin Dashboard         | `app/(dashboard)/minor-admin/page.tsx` | Support tickets, clinic tier evaluation, config proposals |
| Vet Dashboard                 | `app/(dashboard)/vet/page.tsx`    | Branch operations, finances, pending work, customer requests |

---

## Mobile App (Expo / React Native)

### `lib/supabase.ts` — Supabase Client & Type Definitions

| Export          | Type       | Description |
|-----------------|------------|-------------|
| `supabase`      | Client     | Supabase client with `AsyncStorage` for persistent sessions |
| `Profile`       | TypeScript | User profile fields (id, account_number, role, status, etc.) |
| `Pet`           | TypeScript | Pet record (name, species, breed, weight, microchip, etc.) |
| `MedicalRecord` | TypeScript | Diagnosis, treatment, prescriptions, follow-up |
| `Vaccination`   | TypeScript | Vaccine name, batch number, dates, clinic join |
| `Clinic`        | TypeScript | Clinic details with lat/lng for map pins |
| `SkinScan`      | TypeScript | AI scan result with confidence score and severity |

**Relationships:**
- All types are consumed by hooks (`usePets.ts`) and tab screens
- `supabase` client is imported by `AuthContext.tsx`, `usePets.ts`, and all tab screens

---

### `context/AuthContext.tsx` — Mobile Auth State

| Symbol           | Type      | Description |
|------------------|-----------|-------------|
| `AuthProvider`   | Component | Manages `session`, `user`, `profile`, `loading` states |
| `fetchProfile()` | Function  | Queries `profiles` table for the logged-in user's profile row |
| `signIn()`       | Function  | `signInWithPassword()` wrapper |
| `signOut()`      | Function  | `supabase.auth.signOut()` wrapper |
| `useAuth()`      | Hook      | Context consumer shortcut |

**Key Difference from Web:** Returns the full `profile` object (not just `role`) because mobile screens display account numbers, names, etc.

---

### `hooks/usePets.ts` — Pet Data CRUD Hook

| Symbol        | Type     | Description |
|---------------|----------|-------------|
| `usePets()`   | Hook     | Returns `{pets, loading, error, refetch, addPet}` |
| `fetchPets()` | Function | Queries `pets` where `owner_uid = user.id` and `is_active = true` |
| `addPet()`    | Function | Inserts a new pet row with the current user as owner |

**Relationships:**
- Depends on `useAuth().user` for the owner UID
- Used by the Home tab (`index.tsx`) and AI Scanner tab (`ai-checker.tsx`)

---

### `app/_layout.tsx` — Root Layout & Auth Routing

| Symbol           | Type      | Description |
|------------------|-----------|-------------|
| `RootLayout`     | Component | Wraps entire app in `AuthProvider` |
| `RootLayoutNav`  | Component | Handles auth-based routing using `useSegments()` |

**Auth Routing Logic:**
1. No session + not on login/register → redirect to `/login`
2. Has session + on login/register → redirect to `/(tabs)`
3. Uses `useSegments()` to avoid interrupting registration flow

---

### `app/(tabs)/_layout.tsx` — Tab Navigator

Configures five bottom tabs with neobrutalist styling:

| Tab       | Screen File       | Icon              | Description |
|-----------|-------------------|--------------------|-------------|
| Pets      | `index.tsx`       | `house.fill`       | Home screen with pet list and add-pet modal |
| VetBook   | `vetbook.tsx`     | `book.fill`        | Medical records + vaccination timeline |
| Discover  | `discover.tsx`    | `map.fill`         | Clinic discovery with map and cards |
| Scanner   | `ai-checker.tsx`  | `camera.fill`      | AI skin condition scanner |
| Ask AI    | `chatbot.tsx`     | `bubble.fill`      | AI chatbot assistant |

---

### Tab Screen Function Details

#### `index.tsx` (Pets Tab)
- `fetchPets()` via `usePets()` hook — lists the user's active pets
- `handleAddPet()` — opens a modal, validates form, calls `addPet()` from hook
- Displays loading spinner, empty state, or scrollable pet card list

#### `vetbook.tsx` (VetBook Tab)
- `fetchTimeline()` — parallel queries to `medical_records` and `vaccinations` tables
- Merges both arrays with a `_rawDate` field and sorts chronologically
- Pet selector chips with active state highlighting
- Timeline UI with dots, lines, and colored record cards

#### `discover.tsx` (Discover Tab)
- Fetches active clinics from `clinics` table
- Displays a placeholder map graphic with pin
- Renders clinic cards with name, address, operating hours, and action buttons

#### `ai-checker.tsx` (AI Scanner Tab)
- `handleScan()` — simulates camera capture (mock for now)
- `handleSaveResult()` — inserts scan result into `skin_scans` table
- Displays severity badge, diagnosis text, and save/book buttons
- Includes a disclaimer banner about AI limitations

#### `chatbot.tsx` (Ask AI Tab)
- Chat interface with message bubbles
- Input field with send button
- Simulated AI responses (real endpoint pending integration)

---

## ML — Skin Disease Classifier (MobileNetV2)

The `ml/` directory contains a Google Colab–ready PyTorch script that fine-tunes **MobileNetV2** via transfer learning to classify veterinary skin images into three categories:

| Class | Description |
|---|---|
| `Healthy_Dermis` | Normal, healthy skin |
| `Mange` | Demodicosis / sarcoptic mange |
| `Ringworm` | Dermatophytosis (fungal) |

### Dataset

We use the **[Dog's Skin Diseases (Image Dataset)](https://www.kaggle.com/datasets/youssefmohmmed/dogs-skin-diseases-image-dataset)** from Kaggle. This dataset was selected because:
- It contains high-quality, labelled images that directly map to our 3 target classes
- Research papers using MobileNetV2 on this dataset report **96–97% validation accuracy**
- It is purpose-built for AI/ML veterinary classification tasks

**Required folder structure** (PyTorch `ImageFolder` convention):

```
/content/drive/MyDrive/VetDataset/
├── train/                    # ~80% of images
│   ├── Healthy_Dermis/
│   ├── Mange/
│   └── Ringworm/
└── val/                      # ~20% of images
    ├── Healthy_Dermis/
    ├── Mange/
    └── Ringworm/
```

> If you place all images in a single root with class subdirectories (no `train/`/`val/` split), the script will automatically perform an 80/20 split.

### How to Run (Google Colab)

1. Download the dataset from Kaggle and upload it to your Google Drive at `/MyDrive/VetDataset/`
2. Open `ml/vet_skin_classifier.py` in Google Colab (File → Upload notebook, or copy-paste into cells)
3. Set Runtime → Change runtime type → **GPU** (T4 or better)
4. Run each cell sequentially — the script is divided into 11 clearly-marked cells:

| Cell | Purpose |
|---|---|
| 1 | Environment bootstrap & GPU check |
| 2 | Hyperparameter configuration |
| 3 | Google Drive mount |
| 4 | Data loading with augmentation |
| 5 | Batch visualisation (sanity check) |
| 6 | Model architecture (frozen MobileNetV2 + custom head) |
| 7 | Loss, optimiser & LR scheduler setup |
| 8 | Training loop with early stopping |
| 9 | Training curve plots |
| 10 | Model export (`.pt` file) |
| 11 | Single-image inference test |

### Key Hyperparameters

All hyperparameters are defined in the `CONFIG` dict at the top of the script:

| Parameter | Default | Purpose |
|---|---|---|
| `learning_rate` | `1e-3` | Initial Adam LR |
| `epochs` | `30` | Maximum training epochs |
| `batch_size` | `32` | Images per batch |
| `dropout_rate` | `0.35` | Dropout in classifier head |
| `early_stop_patience` | `7` | Epochs without improvement → stop |
| `lr_scheduler_patience` | `3` | Epochs of plateau → halve LR |

### Anti-Overfitting Strategy

1. **Frozen backbone** — Only the classifier head is trained (1280→512→128→3)
2. **Data augmentation** — Random crop, flip, rotation, color jitter, grayscale
3. **Dropout** — Progressive dropout (0.35 → 0.175 → 0.117) across hidden layers
4. **BatchNorm** — After each hidden layer for stable gradient flow
5. **LR scheduling** — `ReduceLROnPlateau` halves LR when val loss stalls
6. **Early stopping** — Monitors val loss, stops after 7 epochs of no improvement
7. **L2 regularisation** — Weight decay of `1e-4` in Adam optimiser

### Output

The script saves:
- `vet_skin_mobilenetv2.pt` — checkpoint with weights, class mapping, config, and normalization stats
- `training_curves.png` — loss, accuracy, and LR plots

---

## Database Schema (Supabase / PostgreSQL)

### Entity Relationship Overview

```
auth.users ──1:1──▶ profiles
     │
     │──1:N──▶ appointments
     │──1:N──▶ support_tickets
     │──1:N──▶ staging_commits
     │──1:N──▶ skin_scans
     │──1:N──▶ pets ──1:N──▶ medical_records
     │                  ├──1:N──▶ vaccinations
     │                  └──1:N──▶ skin_scans
     │
     └──N:M──▶ clinic_staff ◀──N:M── clinics
                                       │
                                       ├──1:N──▶ appointments
                                       ├──1:N──▶ medical_records
                                       ├──1:N──▶ vaccinations
                                       ├──1:N──▶ invoices
                                       └──1:N──▶ queue_entries
```

### Tables

| Table              | Purpose                                      | Key Foreign Keys |
|--------------------|----------------------------------------------|------------------|
| `profiles`         | Extends `auth.users` with app-specific data  | `id → auth.users(id)` |
| `clinics`          | Vet branch information + map coordinates     | — |
| `clinic_staff`     | Many-to-many: users ↔ clinics                | `clinic_id → clinics`, `user_id → auth.users` |
| `pets`             | Customer pet records                         | `owner_uid → auth.users` |
| `appointments`     | Booking records                              | `owner_uid`, `clinic_id`, `vet_uid` |
| `medical_records`  | Diagnoses, treatments, prescriptions         | `pet_id`, `vet_uid`, `clinic_id` |
| `vaccinations`     | Vaccine history                              | `pet_id`, `clinic_id`, `administered_by` |
| `invoices`         | Billing records                              | `clinic_id`, `owner_uid` |
| `skin_scans`       | AI scanner results                           | `pet_id`, `scanned_by` |
| `support_tickets`  | Customer/admin support tickets               | `owner_uid`, `target_clinic_id` |
| `staging_commits`  | Minor Admin config change proposals          | `created_by`, `target_clinic_id` |
| `queue_entries`    | Real-time clinic queue                       | `clinic_id`, `pet_id`, `owner_uid` |
| `chat_sessions`    | AI chatbot conversation logs                 | `user_id` |

### Key Database Functions & Triggers

| Function / Trigger           | Description |
|------------------------------|-------------|
| `handle_updated_at()`        | Auto-updates `updated_at` on row modification. Applied to profiles, clinics, pets, appointments, support_tickets, chat_sessions |
| `handle_new_user()`          | `SECURITY DEFINER` trigger on `auth.users` INSERT — creates the `profiles` row with data from `raw_user_meta_data` |
| `account_number_seq`         | PostgreSQL sequence for collision-free account number generation |

---

## Authentication & Security Flow

### Web Registration Flow

```
1. User fills form → handleRegister()
2. supabase.auth.signUp() → Creates auth.users row
3. handle_new_user trigger → Creates profiles row (status: 'pending_approval')
4. Frontend inserts clinic row → clinics table
5. Frontend links user to clinic → clinic_staff table
6. Redirect to /login → Awaits admin approval
```

### Web Login Flow

```
1. User submits email/password → signIn()
2. supabase.auth.signInWithPassword() → Returns JWT session
3. onAuthStateChange fires → syncSession()
4. fetchRoleFromProfile() → Queries profiles.role
5. ProtectedRoute checks role → Redirects to correct dashboard
```

### API Request Flow (Zero Trust)

```
1. Frontend calls API with: Authorization: Bearer <JWT>
2. zero_trust_auth_middleware intercepts
3. supabase_admin.auth.get_user(token) validates JWT with Supabase
4. Sets request.state.user = {uid, email, role}
5. ai_quota_middleware checks rate limit (AI endpoints only)
6. Route handler executes with verified identity
```

---

## Environment Variables

### Backend (`backend/.env`)
```
ENV=development
SECRET_KEY=<your-secret>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
AI_MODEL_API_KEY=<api-key>
AI_RATE_LIMIT_PER_MIN=5
```

### Web (`web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

---

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Fill in your credentials
uvicorn app.main:app --reload
```

### Web
```bash
cd web
npm install
cp .env.example .env.local    # Fill in your Supabase keys
npm run dev
```

### Mobile
```bash
cd mobile
npm install
# Ensure .env has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

### Database
1. Go to your Supabase Dashboard → SQL Editor
2. Run `backend/docs/supabase_schema.sql` (full schema)
3. Run `backend/docs/schema_patch_phase1.sql` (security patches)
4. Run `backend/docs/schema_patch_v1.2_rls_hotfix.sql` (registration fix)

---

## License

© 2026 VetNary SL. All rights reserved.
