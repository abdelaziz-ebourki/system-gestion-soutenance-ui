# Système Gestion Soutenance — UI

Frontend de la plateforme de gestion, planification et suivi des soutenances universitaires.

## Stack

- **React 19** + **TypeScript 6**
- **Vite 8** (build tool)
- **Tailwind CSS 4** (styling) + **shadcn/ui** (component primitives)
- **TanStack React Query v5** (server state) + **React Table v8** (data grids)
- **React Router v7** (routing)
- **MSW v2** (mock API in development)
- **Zod** (validation)
- **Recharts** (charts), **DnD Kit** (drag & drop), **Sonner** (toasts)

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Demo accounts (mock data)

| Email | Password | Role |
|---|---|---|
| `admin@univh2c.ma` | `1234` | Administrateur |
| `coord@univh2c.ma` | `1234` | Coordinateur |
| `teacher@univh2c.ma` | `1234` | Enseignant |
| `student@univh2c.ma` | `1234` | Étudiant |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with MSW mock API |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint on all source files |
| `npm run lint:spell` | Spell check on all source files |
| `npm run preview` | Preview production build |

## Environment Variables

See `.env.example` for available variables:
- `VITE_MOCK_DELAY` — simulated API latency in ms (default: 1000)

## Architecture

```
src/
  pages/        — Route-level components (lazy-loaded by role)
  components/   — UI primitives (shadcn) + business components
  hooks/        — React Query wrappers + entity CRUD hooks
  lib/          — API client, Zod validations, utilities
  mocks/        — MSW handlers + mock data store
  types/        — TypeScript interfaces & types
  contexts/     — Auth, theme, sidebar providers
  config/       — App configuration (site name, links)
```

Route structure follows roles: `/admin/*`, `/coordinator/*`, `/teacher/*`, `/student/*`. Each role has its own layout, sidebar navigation, and protected routes.

## Mock API

This project uses **MSW** (Mock Service Worker) in development mode. All `/api/*` requests are intercepted in the browser — no backend server is required. Mock data lives in `src/mocks/data.ts` and handlers are split by domain in `src/mocks/handlers-*.ts`.
