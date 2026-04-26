-- =========================================================================
-- PHASE 1: DATABASE SCHEMA, RLS, AND TRIGGERS PATCH
-- =========================================================================

-- 1. Triggers: Implement handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_clinics_updated_at ON public.clinics;
CREATE TRIGGER trg_clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_pets_updated_at ON public.pets;
CREATE TRIGGER trg_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. RLS Policies Fixes
-- Ensure owner_uid and created_by match auth.uid() on INSERT
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "support_tickets_insert" ON public.support_tickets;
CREATE POLICY "support_tickets_insert" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "staging_commits_insert" ON public.staging_commits;
CREATE POLICY "staging_commits_insert" ON public.staging_commits
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'minor_admin'
    );

-- Restrict clinic and staff creation to verified vet profiles
DROP POLICY IF EXISTS "clinics_insert" ON public.clinics;
CREATE POLICY "clinics_insert" ON public.clinics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
              AND role IN ('vet', 'main_admin') 
        )
    );

DROP POLICY IF EXISTS "clinic_staff_insert" ON public.clinic_staff;
CREATE POLICY "clinic_staff_insert" ON public.clinic_staff
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
              AND role IN ('vet', 'main_admin') 
        )
    );

-- Restrict pet SELECT policies to owners/vets/admins
DROP POLICY IF EXISTS "pets_select" ON public.pets;
CREATE POLICY "pets_select" ON public.pets
    FOR SELECT USING (
        auth.uid() = owner_uid OR
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('main_admin', 'minor_admin', 'vet')
    );


-- 3. Foreign Keys: Add ON DELETE CASCADE or SET NULL
-- Appointments
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_owner_uid_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_owner_uid_fkey FOREIGN KEY (owner_uid) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_clinic_id_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_vet_uid_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_vet_uid_fkey FOREIGN KEY (vet_uid) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Medical Records
ALTER TABLE public.medical_records DROP CONSTRAINT IF EXISTS medical_records_vet_uid_fkey;
ALTER TABLE public.medical_records ADD CONSTRAINT medical_records_vet_uid_fkey FOREIGN KEY (vet_uid) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.medical_records DROP CONSTRAINT IF EXISTS medical_records_clinic_id_fkey;
ALTER TABLE public.medical_records ADD CONSTRAINT medical_records_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Invoices
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_clinic_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_owner_uid_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_owner_uid_fkey FOREIGN KEY (owner_uid) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Support Tickets
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_owner_uid_fkey;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_owner_uid_fkey FOREIGN KEY (owner_uid) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_target_clinic_id_fkey;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_target_clinic_id_fkey FOREIGN KEY (target_clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Staging Commits
ALTER TABLE public.staging_commits DROP CONSTRAINT IF EXISTS staging_commits_created_by_fkey;
ALTER TABLE public.staging_commits ADD CONSTRAINT staging_commits_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.staging_commits DROP CONSTRAINT IF EXISTS staging_commits_target_clinic_id_fkey;
ALTER TABLE public.staging_commits ADD CONSTRAINT staging_commits_target_clinic_id_fkey FOREIGN KEY (target_clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Vaccinations
ALTER TABLE public.vaccinations DROP CONSTRAINT IF EXISTS vaccinations_clinic_id_fkey;
ALTER TABLE public.vaccinations ADD CONSTRAINT vaccinations_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.vaccinations DROP CONSTRAINT IF EXISTS vaccinations_administered_by_fkey;
ALTER TABLE public.vaccinations ADD CONSTRAINT vaccinations_administered_by_fkey FOREIGN KEY (administered_by) REFERENCES auth.users(id) ON DELETE SET NULL;


-- 4 & 5. Security Definer with public search_path & Sequence for Collision Free Account Number
CREATE SEQUENCE IF NOT EXISTS public.account_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_number TEXT;
BEGIN
    -- Generate a unique account number using a sequence
    v_account_number := COALESCE(
        NEW.raw_user_meta_data->>'account_number',
        'VN-' || nextval('public.account_number_seq')::text
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
            THEN 'pending_approval'
            ELSE 'active'
        END
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;
