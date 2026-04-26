    -- =========================================================================
    -- VETNARY SYSTEM: SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
    -- =========================================================================
    -- Designed for BOTH the Next.js Web Dashboards AND the React Native Mobile App.
    -- Implements Zero Trust RBAC via Supabase auth.users app_metadata roles.
    -- Run this ENTIRE script in the Supabase SQL Editor (drop old tables first).
    --
    -- Roles: main_admin | minor_admin | vet | customer
    -- =========================================================================

    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


    -- =========================================================================
    -- 1. PROFILES  (extends auth.users with app-specific data)
    -- =========================================================================
    CREATE TABLE public.profiles (
        id             UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        account_number TEXT UNIQUE NOT NULL,                       -- e.g. VN-3827
        full_name      TEXT NOT NULL,
        email          TEXT NOT NULL,
        phone_number   TEXT,
        avatar_url     TEXT,                                       -- profile picture (mobile + web)
        role           TEXT NOT NULL DEFAULT 'customer'             -- mirror of app_metadata.role for easy querying
                    CHECK (role IN ('main_admin','minor_admin','vet','customer')),
        status         TEXT NOT NULL DEFAULT 'active'               -- active | suspended | pending_approval
                    CHECK (status IN ('active','suspended','pending_approval')),
        created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Users read own profile; staff can read all for servicing
    CREATE POLICY "profiles_select" ON public.profiles
        FOR SELECT USING (
            auth.uid() = id OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin','vet')
        );

    -- Users update own profile; Main Admin updates any
    CREATE POLICY "profiles_update" ON public.profiles
        FOR UPDATE USING (
            auth.uid() = id OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );

    -- Users can insert their own profile on registration
    CREATE POLICY "profiles_insert" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);


    -- =========================================================================
    -- 2. CLINICS  (vet branches — now with proper UUID PK & map coordinates)
    -- =========================================================================
    CREATE TABLE public.clinics (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name             TEXT NOT NULL,
        address          TEXT NOT NULL,
        contact          TEXT NOT NULL,
        email            TEXT,
        latitude         DOUBLE PRECISION,                         -- for mobile map pin
        longitude        DOUBLE PRECISION,                         -- for mobile map pin
        operating_hours  TEXT DEFAULT '08:00-18:00',                -- display string
        discount_tier    TEXT DEFAULT 'Standard',
        monthly_volume   INTEGER DEFAULT 0,
        daily_revenue    INTEGER DEFAULT 0,
        hashed_target    TEXT,                                     -- cryptographic hash placeholder
        is_active        BOOLEAN DEFAULT true,
        created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

    -- Anyone authenticated can read clinics (needed for mobile maps & booking)
    CREATE POLICY "clinics_select" ON public.clinics
        FOR SELECT USING (auth.role() = 'authenticated');

    -- Vets and Admins can create clinics
    CREATE POLICY "clinics_insert" ON public.clinics
        FOR INSERT WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    -- Only Main Admins can update clinic financial data & settings
    CREATE POLICY "clinics_update" ON public.clinics
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );


    -- =========================================================================
    -- 3. CLINIC_STAFF  (many-to-many: links users to clinics they work at)
    -- =========================================================================
    CREATE TABLE public.clinic_staff (
        id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        clinic_id   UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
        user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        staff_role  TEXT NOT NULL DEFAULT 'vet'                     -- vet | assistant | receptionist
                    CHECK (staff_role IN ('vet','assistant','receptionist')),
        is_primary  BOOLEAN DEFAULT false,                         -- marks the clinic owner/primary vet
        joined_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
        UNIQUE(clinic_id, user_id)                                 -- no duplicate staffing
    );

    ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

    -- Staff can see their own assignments; Admins can see all
    CREATE POLICY "clinic_staff_select" ON public.clinic_staff
        FOR SELECT USING (
            auth.uid() = user_id OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin')
        );

    -- Vets can create staff entries for their own clinic; Admins can create any
    CREATE POLICY "clinic_staff_insert" ON public.clinic_staff
        FOR INSERT WITH CHECK (
            auth.uid() = user_id OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );

    -- Only Main Admins can modify staff assignments
    CREATE POLICY "clinic_staff_update" ON public.clinic_staff
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );

    CREATE POLICY "clinic_staff_delete" ON public.clinic_staff
        FOR DELETE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );


    -- =========================================================================
    -- 4. PETS  (network-wide pet profiles — enhanced for veterinary use)
    -- =========================================================================
    CREATE TABLE public.pets (
        id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_uid     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name          TEXT NOT NULL,
        species       TEXT NOT NULL,                               -- Dog | Cat | Bird | Reptile | Other
        breed         TEXT,
        gender        TEXT CHECK (gender IN ('male','female','unknown')),
        date_of_birth DATE,                                        -- exact DOB instead of just "age"
        weight_kg     DECIMAL(6,2),                                -- kilograms, 2 decimal places
        microchip_id  TEXT,                                        -- unique microchip number
        photo_url     TEXT,                                        -- pet avatar for mobile app
        notes         TEXT,                                        -- allergies, special conditions
        is_active     BOOLEAN DEFAULT true,                        -- soft delete
        created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

    -- Anyone authenticated can read pets (vets need to service walk-ins)
    CREATE POLICY "pets_select" ON public.pets
        FOR SELECT USING (auth.role() = 'authenticated');

    -- Owners can insert their own pets
    CREATE POLICY "pets_insert" ON public.pets
        FOR INSERT WITH CHECK (auth.uid() = owner_uid);

    -- Owners can update their own pets; vets and admins can update any (for medical notes)
    CREATE POLICY "pets_update" ON public.pets
        FOR UPDATE USING (
            auth.uid() = owner_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    -- Only owners or admins can delete
    CREATE POLICY "pets_delete" ON public.pets
        FOR DELETE USING (
            auth.uid() = owner_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );


    -- =========================================================================
    -- 5. APPOINTMENTS  (booking system — enhanced with vet assignment)
    -- =========================================================================
    CREATE TABLE public.appointments (
        id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_uid         UUID REFERENCES auth.users(id) NOT NULL,
        clinic_id         UUID REFERENCES public.clinics(id) NOT NULL,
        pet_id            UUID REFERENCES public.pets(id) NOT NULL,
        vet_uid           UUID REFERENCES auth.users(id),          -- assigned vet (nullable until confirmed)
        appointment_date  TIMESTAMPTZ NOT NULL,
        duration_minutes  INTEGER DEFAULT 30,
        status            TEXT DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled','no_show')),
        reason            TEXT,
        notes             TEXT,                                     -- vet post-visit notes
        created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

    -- Customers read own; Vets read their clinic's; Admins read all
    CREATE POLICY "appointments_select" ON public.appointments
        FOR SELECT USING (
            auth.uid() = owner_uid OR
            auth.uid() = vet_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin') OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = appointments.clinic_id AND cs.user_id = auth.uid()
            )
        );

    -- Anyone authenticated can create an appointment (mobile booking)
    CREATE POLICY "appointments_insert" ON public.appointments
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    -- Owners update own; Vets update their assigned; Admins update any
    CREATE POLICY "appointments_update" ON public.appointments
        FOR UPDATE USING (
            auth.uid() = owner_uid OR
            auth.uid() = vet_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin' OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = appointments.clinic_id AND cs.user_id = auth.uid()
            )
        );


    -- =========================================================================
    -- 6. MEDICAL RECORDS  (diagnosis, treatment, prescriptions per visit)
    -- =========================================================================
    CREATE TABLE public.medical_records (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        appointment_id   UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
        pet_id           UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
        vet_uid          UUID REFERENCES auth.users(id) NOT NULL,  -- who wrote the record
        clinic_id        UUID REFERENCES public.clinics(id) NOT NULL,
        diagnosis        TEXT NOT NULL,
        treatment        TEXT,
        prescriptions    TEXT,                                      -- comma-separated or JSON
        follow_up_date   DATE,
        attachments      TEXT[],                                    -- array of file URLs (X-rays, lab results)
        notes            TEXT,
        created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

    -- Pet owners read their pet's records; Vets read records from their clinic; Admins read all
    CREATE POLICY "medical_records_select" ON public.medical_records
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.pets p WHERE p.id = medical_records.pet_id AND p.owner_uid = auth.uid()) OR
            auth.uid() = vet_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin') OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = medical_records.clinic_id AND cs.user_id = auth.uid()
            )
        );

    -- Only vets and admins can create medical records
    CREATE POLICY "medical_records_insert" ON public.medical_records
        FOR INSERT WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    -- Only the authoring vet or admins can update
    CREATE POLICY "medical_records_update" ON public.medical_records
        FOR UPDATE USING (
            auth.uid() = vet_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );


    -- =========================================================================
    -- 7. INVOICES  (billing & payment tracking)
    -- =========================================================================
    CREATE TABLE public.invoices (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        appointment_id   UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
        clinic_id        UUID REFERENCES public.clinics(id) NOT NULL,
        owner_uid        UUID REFERENCES auth.users(id) NOT NULL,  -- who's paying
        pet_id           UUID REFERENCES public.pets(id),
        items            JSONB NOT NULL DEFAULT '[]',               -- [{description, qty, unit_price}]
        subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        total            DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method   TEXT CHECK (payment_method IN ('cash','card','online','pending')),
        payment_status   TEXT DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','partial','refunded')),
        paid_at          TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

    -- Owners see own invoices; Vets see their clinic's; Admins see all
    CREATE POLICY "invoices_select" ON public.invoices
        FOR SELECT USING (
            auth.uid() = owner_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin') OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = invoices.clinic_id AND cs.user_id = auth.uid()
            )
        );

    -- Vets and admins can create invoices
    CREATE POLICY "invoices_insert" ON public.invoices
        FOR INSERT WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    -- Vets and admins can update invoices (mark as paid, etc.)
    CREATE POLICY "invoices_update" ON public.invoices
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet') OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = invoices.clinic_id AND cs.user_id = auth.uid()
            )
        );


    -- =========================================================================
    -- 8. SKIN SCANS  (AI skin disease detection results)
    -- =========================================================================
    CREATE TABLE public.skin_scans (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        pet_id           UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
        scanned_by       UUID REFERENCES auth.users(id) NOT NULL,  -- vet or customer who ran the scan
        image_url        TEXT NOT NULL,                             -- uploaded photo
        ai_result        TEXT,                                      -- predicted disease/condition
        confidence_score DECIMAL(5,4),                              -- 0.0000 to 1.0000
        severity         TEXT CHECK (severity IN ('low','medium','high','critical')),
        vet_reviewed     BOOLEAN DEFAULT false,                     -- has a vet confirmed/overridden?
        vet_notes        TEXT,                                      -- vet's professional opinion
        reviewed_by      UUID REFERENCES auth.users(id),            -- which vet reviewed
        created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.skin_scans ENABLE ROW LEVEL SECURITY;

    -- Pet owners see their pet's scans; Vets and Admins see all
    CREATE POLICY "skin_scans_select" ON public.skin_scans
        FOR SELECT USING (
            auth.uid() = scanned_by OR
            EXISTS (SELECT 1 FROM public.pets p WHERE p.id = skin_scans.pet_id AND p.owner_uid = auth.uid()) OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    -- Authenticated users can create scans (mobile app feature)
    CREATE POLICY "skin_scans_insert" ON public.skin_scans
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    -- Only vets and admins can update (review, override AI result)
    CREATE POLICY "skin_scans_update" ON public.skin_scans
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );


    -- =========================================================================
    -- 9. NOTIFICATIONS  (mobile push + web notification storage)
    -- =========================================================================
    CREATE TABLE public.notifications (
        id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        type        TEXT DEFAULT 'general'                          -- appointment | medical | billing | general | alert
                    CHECK (type IN ('appointment','medical','billing','general','alert')),
        reference_id UUID,                                         -- FK to related entity (appointment_id, invoice_id, etc.)
        is_read     BOOLEAN DEFAULT false,
        created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    -- Users can only read their own notifications
    CREATE POLICY "notifications_select" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);

    -- System/admins can insert notifications for any user
    CREATE POLICY "notifications_insert" ON public.notifications
        FOR INSERT WITH CHECK (
            auth.uid() = user_id OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin','vet')
        );

    -- Users can mark their own notifications as read
    CREATE POLICY "notifications_update" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);

    -- Users can delete their own notifications
    CREATE POLICY "notifications_delete" ON public.notifications
        FOR DELETE USING (auth.uid() = user_id);


    -- =========================================================================
    -- 10. SUPPORT TICKETS  (Minor Admin Contact Center)
    -- =========================================================================
    CREATE TABLE public.support_tickets (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_uid       UUID REFERENCES auth.users(id) NOT NULL,
        target_clinic_id UUID REFERENCES public.clinics(id),       -- optional: specific clinic complaint
        subject         TEXT NOT NULL,
        description     TEXT NOT NULL,
        status          TEXT DEFAULT 'open'
                        CHECK (status IN ('open','in_progress','resolved','closed')),
        priority        TEXT DEFAULT 'normal'
                        CHECK (priority IN ('low','normal','high','urgent')),
        resolved_by     UUID REFERENCES auth.users(id),
        resolved_at     TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

    -- Customers read own; Admins read all; Vets read if targeted at their clinic
    CREATE POLICY "support_tickets_select" ON public.support_tickets
        FOR SELECT USING (
            auth.uid() = owner_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin') OR
            EXISTS (
                SELECT 1 FROM public.clinic_staff cs
                WHERE cs.clinic_id = support_tickets.target_clinic_id AND cs.user_id = auth.uid()
            )
        );

    -- Anyone authenticated can create support tickets
    CREATE POLICY "support_tickets_insert" ON public.support_tickets
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    -- Admins can update tickets (assign, resolve, close)
    CREATE POLICY "support_tickets_update" ON public.support_tickets
        FOR UPDATE USING (
            auth.uid() = owner_uid OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin')
        );


    -- =========================================================================
    -- 11. STAGING COMMITS  (Main Admin Authorization Queue)
    -- =========================================================================
    CREATE TABLE public.staging_commits (
        id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_by            UUID REFERENCES auth.users(id) NOT NULL,
        target_clinic_id      UUID REFERENCES public.clinics(id) NOT NULL,
        proposed_discount_tier TEXT,
        justification         TEXT NOT NULL,
        status                TEXT DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
        reviewed_by           UUID REFERENCES auth.users(id),
        reviewed_at           TIMESTAMPTZ,
        created_at            TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.staging_commits ENABLE ROW LEVEL SECURITY;

    -- Only Admins can view the staging queue
    CREATE POLICY "staging_commits_select" ON public.staging_commits
        FOR SELECT USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin')
        );

    -- Minor Admins can create proposals
    CREATE POLICY "staging_commits_insert" ON public.staging_commits
        FOR INSERT WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'minor_admin'
        );

    -- Only Main Admins can approve/reject
    CREATE POLICY "staging_commits_update" ON public.staging_commits
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );

    CREATE POLICY "staging_commits_delete" ON public.staging_commits
        FOR DELETE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
        );


    -- =========================================================================
    -- 12. VACCINATIONS  (Digital Vet Book for Mobile)
    -- =========================================================================
    CREATE TABLE public.vaccinations (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        pet_id           UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
        clinic_id        UUID REFERENCES public.clinics(id),
        administered_by  UUID REFERENCES auth.users(id),            -- the vet
        vaccine_name     TEXT NOT NULL,
        batch_number     TEXT,
        date_administered DATE NOT NULL,
        next_due_date    DATE,
        notes            TEXT,
        created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

    -- Pet owners read their pet's vaccines; Vets and Admins read all
    CREATE POLICY "vaccinations_select" ON public.vaccinations
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.pets p WHERE p.id = vaccinations.pet_id AND p.owner_uid = auth.uid()) OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','minor_admin','vet')
        );

    -- Only vets and admins create/update vaccines
    CREATE POLICY "vaccinations_insert" ON public.vaccinations
        FOR INSERT WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );

    CREATE POLICY "vaccinations_update" ON public.vaccinations
        FOR UPDATE USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin','vet')
        );


    -- =========================================================================
    -- 13. CHAT SESSIONS & MESSAGES  (AI Chatbot for Mobile)
    -- =========================================================================
    CREATE TABLE public.chat_sessions (
        id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title       TEXT DEFAULT 'New Chat',
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    CREATE TABLE public.chat_messages (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        session_id      UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
        sender_role     TEXT NOT NULL CHECK (sender_role IN ('user','ai','system')),
        content         TEXT NOT NULL,
        created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

    -- Users can only read/write their own chat sessions
    CREATE POLICY "chat_sessions_all" ON public.chat_sessions
        FOR ALL USING (auth.uid() = user_id);

    -- Users can only read/write messages in their own sessions
    CREATE POLICY "chat_messages_all" ON public.chat_messages
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.chat_sessions cs WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid())
        );


    -- =========================================================================
    -- INDEXES  (performance optimizations for common queries)
    -- =========================================================================
    CREATE INDEX idx_profiles_role ON public.profiles(role);
    CREATE INDEX idx_profiles_status ON public.profiles(status);
    CREATE INDEX idx_clinic_staff_clinic ON public.clinic_staff(clinic_id);
    CREATE INDEX idx_clinic_staff_user ON public.clinic_staff(user_id);
    CREATE INDEX idx_pets_owner ON public.pets(owner_uid);
    CREATE INDEX idx_appointments_owner ON public.appointments(owner_uid);
    CREATE INDEX idx_appointments_clinic ON public.appointments(clinic_id);
    CREATE INDEX idx_appointments_vet ON public.appointments(vet_uid);
    CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
    CREATE INDEX idx_appointments_status ON public.appointments(status);
    CREATE INDEX idx_medical_records_pet ON public.medical_records(pet_id);
    CREATE INDEX idx_medical_records_vet ON public.medical_records(vet_uid);
    CREATE INDEX idx_invoices_owner ON public.invoices(owner_uid);
    CREATE INDEX idx_invoices_clinic ON public.invoices(clinic_id);
    CREATE INDEX idx_invoices_status ON public.invoices(payment_status);
    CREATE INDEX idx_skin_scans_pet ON public.skin_scans(pet_id);
    CREATE INDEX idx_notifications_user ON public.notifications(user_id);
    CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
    CREATE INDEX idx_support_tickets_owner ON public.support_tickets(owner_uid);
    CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
    CREATE INDEX idx_vaccinations_pet ON public.vaccinations(pet_id);
    CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id);
    CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
