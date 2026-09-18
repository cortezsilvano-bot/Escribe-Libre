-- Development-only seed data. Never execute against production.
--
-- Escribe Libre is local-first: documents are created in the browser and stored
-- in IndexedDB, so a fresh database needs no rows to run the app. This file is
-- kept as the seam for seeding demo documents once the Supabase implementation
-- of DocumentRepository lands (IMPLEMENTATION_PLAN.md, Milestone 5).
--
-- Seeding documents requires an auth user to own them, so any INSERT here must
-- reference a real auth.users row created in your development project first.

select 1;
