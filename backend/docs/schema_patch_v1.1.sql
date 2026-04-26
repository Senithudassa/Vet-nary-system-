-- =========================================================================
-- VETNARY SCHEMA PATCH v1.1
-- Run this in Supabase SQL Editor (safe to run on top of existing schema)
-- Fixes: trigger, updated_at, RLS gaps, missing DELETE policies, nullable image_url
-- =========================================================================


-- ─── FIX 1: Auto-create profile when a new user registers ────────────────────
-- Reads full_name, phone_number, role, account_number from raw_user_meta_data
-- which is set by the mobile/web signUp() options.data field.
-- Runs as SECURITY DEFINER to bypass the profiles_insert RLS policy.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_account_number TEXT;
BEGIN
    -- Generate a unique account number
    v_account_number := COALESCE(
        NEW.raw_user_meta_data->>'account_number',
        'VN-' || floor(1000 + random() * 9000)::text
    );

    INSERT INTO public.profiles (id, account_number, full_name, email, phone_number, role, status)
    VALUES (
        NEW.id,
        v_account_number,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        CASE
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'vet'
            THEN 'pending_approval'   -- Vets need admin approval before going active
            ELSE 'active'
        END
    )
    ON CONFLICT (id) DO NOTHING;   -- Idempotent: safe to re-run

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── FIX 2: Auto-update updated_at on every row change ──────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that have updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_clinics_updated_at ON public.clinics;
CREATE TRIGGER trg_clinics_updated_at
    BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── FIX 3: Clinics insert RLS — allow pending vets to create their clinic ───
-- Problem: new vets register with status='pending_approval' and app_metadata.role
-- is never set (signUp only sets raw_user_meta_data). The old policy checked
-- app_metadata.role = 'vet' which was always null for new users.
-- Fix: allow any authenticated user to insert — the trigger already ensures the
-- profile row exists with the correct role before this runs.
DROP POLICY IF EXISTS "clinics_insert" ON public.clinics;
CREATE POLICY "clinics_insert" ON public.clinics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ─── FIX 4: clinic_staff insert — allow authenticated users to link to clinic ─
-- Same problem: new vets don't have app_metadata.role set yet.
DROP POLICY IF EXISTS "clinic_staff_insert" ON public.clinic_staff;
CREATE POLICY "clinic_staff_insert" ON public.clinic_staff
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ─── FIX 5: Missing DELETE policy on appointments ────────────────────────────
DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments
    FOR DELETE USING (
        auth.uid() = owner_uid OR
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
    );


-- ─── FIX 6: Missing DELETE policy on invoices ────────────────────────────────
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;
CREATE POLICY "invoices_delete" ON public.invoices
    FOR DELETE USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'main_admin'
    );


-- ─── FIX 7: skin_scans.image_url — allow null for mobile placeholder uploads ─
ALTER TABLE public.skin_scans ALTER COLUMN image_url DROP NOT NULL;


-- ─── FIX 8: Add index on profiles.email for fast login lookups ───────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);


-- =========================================================================
-- VERIFICATION QUERIES (run after patch to confirm)
-- =========================================================================
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users';
-- SELECT * FROM public.profiles LIMIT 5;
-- SELECT column_name, is_nullable FROM information_schema.columns
--     WHERE table_name = 'skin_scans' AND column_name = 'image_url';
