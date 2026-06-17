# Lyptron

Marketing site, admin console, and client portal for Lyptron — built on Next.js 16, React 19, TypeScript, Tailwind v4, and Supabase.

## Stack

- **Next.js 16** (App Router) + React 19
- **TypeScript**
- **Tailwind v4** for styling
- **Supabase** for auth, database, and RLS
- **Framer Motion** + **GSAP** for motion
- **react-three-fiber** for the hero canvas
- **Recharts** for admin analytics

## Getting started

```bash
npm install
npm run dev
# http://localhost:3000
```

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and required for `/api/admin/danger` (destructive admin ops).

## Database

Run `supabase-schema.sql` against your Supabase project. It's idempotent — safe to re-run.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

## Routes

- `/` — marketing landing page
- `/privacy`, `/terms` — legal
- `/admin` — admin console (Supabase auth, invite-only)
- `/client` — client portal login (access code)
- `/client/[code]/...` — per-project portal (dashboard, timeline, deliverables, approvals, feedback, finance, documents, meetings, team, gallery)

## Project layout

```
src/
  app/            Next.js routes
  components/     UI + section components
  lib/            db, auth, theme, helpers
  hooks/          shared React hooks
  data/           static content (services, projects, team)
  styles/         global + animation CSS
```
