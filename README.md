# The Great Nile Migration Safaris — fresh application

React, TypeScript, Vite, Tailwind, React Router and Supabase. This is independent of the previous Next.js project and the temporary `preview/` HTML files. Do not use those files to preview this app.

## Run locally

Use Node 22 or newer. In this folder run `npm install`, then `npm run dev`. Open the exact local URL printed by Vite (normally http://127.0.0.1:5173). `npm run build` type-checks and creates `dist/`. `npm run preview` serves that output. Configure deployment hosting to rewrite unknown non-asset URLs to `/index.html` for React Router deep links.

## Connect Supabase

1. Create or select your Supabase project. Copy `.env.example` to `.env.local` and fill the project URL and public publishable key. Never put a service-role key in a `VITE_` variable or browser code.
2. Apply the SQL files in `supabase/migrations/` in numeric order to a fresh project using Supabase CLI migrations or SQL Editor. They create tables, indexes, update triggers, RLS, private buckets, two draft itineraries, day-reordering logic and a settings row. Draft itineraries intentionally do not appear on the public website.
3. Deploy `submit-photo` and `manage-photo` Edge Functions. Their standard Supabase server secrets provide the service role; never copy it into client code. Set `SITE_ORIGIN` to your exact website origin, including its port locally. The functions disable gateway JWT verification: `manage-photo` explicitly verifies the user token and database admin role before any operation; `submit-photo` is a public controlled upload endpoint.
4. Create the first user manually in Supabase Authentication. Insert that user's UUID into `public.profiles` with role `admin`. There is no public registration. Keep Supabase public user signup disabled for this administrator-only project.
5. Open `/admin/login`. Edit website settings, fill in real contact details, edit the two draft itineraries and publish only after verifying their details.

## Data and security

Public queries are restricted by RLS to published itineraries and approved, published gallery metadata. Enquiries are insert-only for visitors. Pending photo metadata and objects are private. Storage downloads require an admin role or a corresponding approved, published gallery row. Both buckets remain private; public gallery images use short-lived signed URLs (5 minutes). Previously issued signed URLs may remain usable until expiry after unpublishing.

The submission function validates bytes, MIME type, size, details and consent; generates unique paths; and cleans up uploaded files if metadata insertion fails. Approval copies a private photograph into the gallery bucket as approved but unpublished. A separate publish operation is required. Repeated approval updates the corresponding gallery record. Permanent deletion removes related objects and records; failed operations report failure. Multi-service storage/database operations are not transactional and need operational monitoring/reconciliation before a production launch.

## Current verification boundary

No Supabase project is configured in this checkout. No login, submission, enquiry, approval or other database operation has been represented as successful. Those flows require live integration tests after configuration. Missing service states are shown on forms. The app is a working local frontend and backend source implementation, not a verified production deployment.

Before public launch, add abuse prevention/rate limits and a challenge to public upload and enquiry endpoints, monitor storage quotas, test all RLS policies against anon/editor/admin accounts, configure email/auth settings, add real licensed company images, and review legal drafts and migration copy. Image placeholders must not be described as photographs of South Sudan. Replace the hero asset in `src/styles.css` with licensed company photography. An official logo must be used without alteration.

## Editing

- Company data: `/admin/settings`, backed by `website_settings`.
- Safaris: `/admin/itineraries`; line-separated lists are stored as arrays. Days can be added and edited.
- Public editorial copy: `src/config/content.ts`.
- Layout/navigation: `src/components/Layout.tsx`.
- Booking/contact forms: `src/forms/Enquiries.tsx`.
- Photo submission: `src/forms/Upload.tsx`.
- Policies: `src/pages/Legal.tsx` — drafts requiring legal review.

## Outstanding scope

A full database-backed editorial content editor, sitemap generation and comprehensive browser/integration QA still need implementation. The current generic admin editor handles record fields, company-photo uploads and day editing/reordering but should be refined for operator usability. Reads are bounded to 100 records. Page-specific metadata and canonical URLs are supported. No GitHub synchronization or public deployment was performed. Source can be committed normally; secrets, dependencies and build output are ignored.

## Checks performed

Production TypeScript/Vite build passed. The local server returned HTTP 200. Browser checks verified separate Migration and Booking pages, unavailable-service notices, `/admin` redirecting to `/admin/login`, and the mobile menu opening and navigating to About at 390px width. Supabase integration tests remain unperformed because no project is connected.
