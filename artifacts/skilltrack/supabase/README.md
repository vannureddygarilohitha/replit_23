# Supabase setup

SkillTrack can run immediately in **Demo mode** with sample records saved in the
current browser. To use a private, persistent Supabase workspace:

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Replit
   environment variables. The supplied project values are already configured
   for this workspace.
2. Open the Supabase SQL Editor and run `schema.sql` once. It creates the
   SkillTrack tables, row-level security policies, and the first-login demo
   seeding function.
3. Enable email/password sign-in in Supabase Authentication. If email
   confirmation is enabled, complete the confirmation link before signing in.
4. Create an HR Admin account in SkillTrack. The first signed-in visit creates
   an isolated workspace and seeds 12 sample employees plus skills,
   certifications, courses, enrollments, and skill gaps.

Every application table is scoped to the signed-in Supabase user with
row-level security. The app uses only the publishable key in the browser; do
not put a Supabase `service_role` key in frontend code.
