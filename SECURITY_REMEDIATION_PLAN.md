# Security and Stability Remediation Plan

Status key: `[ ]` not started, `[~]` in progress, `[x]` complete.

## Phase 1 - Stabilize the codebase

Status: `[x]`

- [x] Move admin project context and `useProject` out of the Next route layout.
- [x] Fix React lint errors in hover/client loading effects.
- [x] Wire the service detail modal so the existing "details" callback is used.
- [x] Run TypeScript and ESLint.

## Phase 2 - Enforce admin roles outside the UI

Status: `[x]`

- [x] Replace broad `is_admin()` checks with role-aware database helpers.
- [x] Tie admin records to authenticated users by `auth.uid()` when available, with an email fallback for existing rows.
- [x] Restrict finance, subscriptions, expenses, settings, and admin-user tables by role.
- [x] Review direct Supabase client calls that touch privileged tables.

## Phase 3 - Fix schema and data correctness bugs

Status: `[x]`

- [x] Align admin settings UI fields with the actual `agency_settings` schema.
- [x] Decide invoice retention behavior and make delete/reset flows match it.
- [x] Implement the missing `/api/admin/danger` endpoint.

## Phase 4 - Sanitize client-visible inputs

Status: `[x]`

- [x] Add shared URL validation for stored links.
- [x] Apply validation to documents, meetings, deployments, gallery URLs, and deliverable links.
- [x] Render external links defensively.

## Phase 5 - Reduce data exposure

Status: `[x]`

- [x] Update the client project bundle RPC to return explicit safe team fields.
- [x] Exclude internal email, salary, timestamps, and admin metadata from client portal responses.

## Phase 6 - Add public abuse controls

Status: `[x]`

- [x] Add length constraints for inquiries, feedback, gallery captions, and approval responses.
- [x] Add rate limits for public/client write paths.
- [x] Add database constraints around gallery URL shape. Storage dashboard policies still need production verification.

## Phase 7 - App hardening

Status: `[x]`

- [x] Add security headers in `next.config.ts`.
- [x] Defer full CSP to a dedicated pass after inline scripts and font loading are reviewed.
- [x] Make access-code length, UI copy, and generated format consistent.

## Phase 8 - Final verification

Status: `[x]`

- [x] Run ESLint.
- [x] Run TypeScript.
- [x] Run a production build.
- [ ] Manually test admin, client portal, settings, links, and reset/delete flows against a real Supabase project.
