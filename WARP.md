# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands you’ll use

Use npm (a `package-lock.json` is present).

- Install deps
  - npm ci
- Dev (Turbopack, port 5000)
  - npm run dev
  - App URL: http://localhost:5000
- Build
  - npm run build
- Start production server (port 5000)
  - npm start
- Lint (ESLint + Next.js config)
  - npm run lint

Notes
- Tests are not configured (no Jest/Vitest/Playwright). There is no test script and no way to run a single test at present.
- The default README mentions port 3000; this app actually runs on 5000 (see `package.json`).

## High-level architecture

This is a Next.js App Router application (React 19 + TypeScript), styled with Tailwind CSS v4 via PostCSS, and using shadcn/ui (Radix primitives) for components. Client-side auth, storage, and database operations are handled via the Insforge SDK.

Key technologies
- Next.js 16 (App Router) with Turbopack in dev (`next.config.ts` sets turbopack root)
- TypeScript with strict config (`tsconfig.json`)
- ESLint using `eslint-config-next` (see `eslint.config.mjs`)
- Tailwind CSS v4 via `@tailwindcss/postcss` (configured in `postcss.config.mjs`); no separate `tailwind.config.*`—design tokens live in `app/globals.css`
- shadcn/ui + Radix UI + `lucide-react` icons (see `components.json` and `components/ui/*`)
- Theme management via `next-themes` in a custom `ThemeProvider`
- Toasts via `sonner`

Routing (App Router)
- `app/page.tsx` — public landing page (marketing-style)
- `app/auth/login/page.tsx` and `app/auth/signup/page.tsx` — client components for email/password and OAuth flows via Insforge
- `app/dashboard/page.tsx` — authenticated dashboard for file management (upload, list, search, filter, sort, bulk delete, QR share)
- `app/share/[token]/page.tsx` — public share page for downloading a file given a share token
- `app/layout.tsx` applies global theme, fonts (Google Fonts via CDN links for Turbopack compatibility), and the toaster

Data layer and external services
- Insforge SDK (`lib/insforge.ts`):
  - Auth: `signUp`, `signInWithPassword`, `signInWithOAuth`, `getCurrentUser`, `signOut`
  - Storage: bucket `user-files` used for uploads (`upload`, `remove`)
  - Database: table `files` (fields used in code: `id, user_id, file_name, file_url, file_key, file_size, file_type, share_token, downloads, created_at`)
- Utilities in `lib/file-utils.ts`:
  - `formatFileSize`, `getFileIcon`, `validateFile` (10GB default limit)
  - `generateShareUrl(token)` builds links using `process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'`
  - `formatDate`
- UI helpers: `lib/utils.ts` exports `cn()` (tailwind-merge + clsx)

State and UX
- The dashboard is a client component that:
  - Auth-gates on mount (`insforge.auth.getCurrentUser()`), redirecting to `/auth/login` when unauthenticated
  - Uploads via `insforge.storage.from('user-files').upload` then persists metadata in `insforge.database.from('files').insert`
  - Presents an analytics header (computed from the `files` list), search, filter-by-type, sort, selection, and delete flows
  - Generates share links with `nanoid` tokens and supports QR codes via a modal
- The share page looks up a file by `share_token`, increments `downloads`, and opens the file URL

Styling and theming
- Tailwind v4 is wired through PostCSS only; tokens and theme variables are defined in `app/globals.css` (including light/dark CSS variables, animations, and “glass” styles)
- Fonts are loaded via `<link>` tags in `app/layout.tsx` (Inter + Fira Code) rather than `next/font` to avoid Turbopack issues
- Theme toggling via `components/theme-provider.tsx` and `components/theme-toggle.tsx`

Environment
- `NEXT_PUBLIC_APP_URL` affects generated share links (see `lib/file-utils.ts`). For local dev the default is `http://localhost:5000`; set this in production to your deployed URL so links resolve correctly.

What’s not here
- No test framework or scripts are defined
- No dedicated Tailwind config file (Tailwind v4 is configured via PostCSS and CSS-in-file tokens)
