-- =========================================================================
-- HOTFIX: RLS Registration Block
-- =========================================================================
-- Phase 1 accidentally completely locked out newly registered vets from 
-- creating their clinic row during signup because their status is `pending_approval`.
-- This patch relaxes INSERT policies to allow any vet to insert.

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
