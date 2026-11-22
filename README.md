# PURE Education ERP: Admin Dashboard

SvelteKit implementation of the **Pure Education (ERP)** Figma file.

**Stack:** Svelte 5 (runes) · SvelteKit 3 · Skeleton UI 5 · Tailwind CSS 4 · TanStack Query (svelte-query 6) · Chart.js 4 · Iconify (Lucide, bundled offline) · svelte-sonner (toasts) · TypeScript

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # svelte-check / TypeScript
npm run build        # production build
```

### Environment

Variables are declared in `src/env.ts` (SvelteKit 3 `defineEnvVars`) and set in `.env`:

| Variable       | Purpose                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `API_BASE_URL` | Base URL of your ERP REST API, e.g. `https://api.example.com/v1`                                                |
| `API_MOCK`     | `true` answers API calls from `src/lib/mocks` (development preview only). **Set to `false` for production.** |

The included `.env` has `API_MOCK=true`, so the app runs straight away with the Figma content. With `API_MOCK=false` the mock module is never loaded: all data comes from `API_BASE_URL` through the service layer.

### Docker

Start the backend first (`pure-erp-api`). Both stacks reach it through the host on `:8100`.

```bash
# development: Vite with live reload on http://localhost:5173, reads .env
docker compose -f docker-compose.dev.yml up -d --build

# production-like: static build served by nginx on http://localhost:8080
docker compose up -d --build
```

The production image (`Dockerfile`, target `prod`) builds the app with `adapter-static` and serves it with nginx (`docker/nginx.conf.template`). nginx falls back to `index.html` for SPA routes and proxies `/api` to the backend, so session cookies stay same-origin, the same way the Vite dev proxy does it.

| Variable           | Where   | Default                            | Purpose                                         |
| ------------------ | ------- | ---------------------------------- | ----------------------------------------------- |
| `API_UPSTREAM`     | prod    | `http://host.docker.internal:8100` | Backend nginx proxies `/api` to (runtime)       |
| `API_BASE_URL`     | prod    | `/api`                             | Build arg: baked into the bundle                |
| `WEB_HOST_PORT`    | prod    | `8080`                             | Host port for nginx                             |
| `API_PROXY_TARGET` | dev     | `http://host.docker.internal:8100` | Backend for the Vite `/api` proxy               |
| `WEB_DEV_HOST_PORT`| dev     | `5173`                             | Host port for Vite                              |

`API_MOCK` is always `false` in the production image. Because `API_BASE_URL` is a static public variable, changing it requires a rebuild.

## Project structure

```
src/
├── env.ts                       # typed env vars
├── app.css                      # Tailwind + Skeleton + Figma tokens (@theme)
├── lib/
│   ├── components/
│   │   ├── ui/                  # Button, Input, Select, Textarea, Checkbox, RadioCard, Toggle,
│   │   │                        # Modal (center/drawer), Dropdown, Tooltip, StatusBadge, Tag,
│   │   │                        # Avatar, LazyImage, Spinner, Tabs, Panel, Empty/Error states,
│   │   │                        # skeleton/ (Skeleton, Table, ListItem, Chart)
│   │   ├── layout/              # Sidebar, Navbar, PageHeader, ModuleLayout
│   │   ├── navigation/          # NavLink, AccountMenu
│   │   ├── tables/              # DataTable, TableToolbar, Pagination, ResourceTable, ResourcePage
│   │   ├── charts/              # ChartCanvas, TrendLineChart, ComparisonBarChart, DoughnutChart, chart-config
│   │   ├── forms/               # FormDrawer (schema-driven "Add New …" forms)
│   │   ├── dashboard/ crm/ projects/ sales/ settings/
│   ├── services/                # http client + one service per domain (no UI code)
│   ├── queries/                 # TanStack Query keys, query/mutation factories, QueryClient config
│   ├── stores/                  # ui.svelte.ts (sidebar, mobile nav, business switcher)
│   ├── constants/               # navigation, endpoints, form schemas, status tones, icons
│   ├── types/                   # domain types
│   ├── utils/                   # format, validation, debounce, cn
│   ├── theme/pure.css           # Skeleton theme generated from the Figma colour variables
│   └── mocks/                   # DEV ONLY fixtures + mock router (behind API_MOCK)
└── routes/                      # one route per screen / tab
```

> SvelteKit 3 replaced `$lib` with Node subpath imports: use `#lib/...` with the file extension (`#lib/utils/format.ts`, `#lib/components/ui/button/Button.svelte`).

## Screens

| Module           | Routes                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview         | `/` stat cards, Revenue & Expenses chart (Weekly/Monthly/Yearly), activities, outstanding payments, upcoming work, attention, recent sales table                                                                              |
| CRM & Contacts   | `/crm/contacts`, `/crm/pipeline` (kanban), `/crm/universities`, `/crm/consultants`                                                                                                                                          |
| Project & Board  | `/projects` (board grid, search, business/status filters, Create Board), `/projects/[id]` (lists, cards, add list/task, card actions menu, Move Card, Share Board, Change Visibility, Filter drawer, card detail with message/note/activity). Completed boards open in **viewer** (read-only) mode |
| Sales            | `/sales/orders`, `/sales/orders/[id]` (Order Details + Edit Order), `/sales/quotations`, `/sales/items`                                                                                                                      |
| Invoices         | `/invoices/customer-invoices`, `/invoices/payments`, `/invoices/history`                                                                                                                                                     |
| Finance          | `/finance/income-expense`, `/finance/transactions`, `/finance/cash-flow` (bar + doughnut charts)                                                                                                                             |
| HR & Payroll     | `/hr/employees`, `/hr/attendance`, `/hr/leave`, `/hr/payroll`, `/hr/departments`                                                                                                                                             |
| Setting          | `/settings/roles` (role list + permission matrix), `/settings/company` (with/without branches), `/settings/users`, `/settings/security`                                                                                     |

Every list has search (debounced), page size, pagination, a "View" detail dialog, and its "Add New …" drawer with validation. Every data section has skeleton, error (with retry), empty and success states.

## Data layer

- **Services** (`lib/services/*.service.ts`) wrap REST endpoints from `constants/endpoints.ts`. Lists return `{ items, total, page, pageSize }` and accept `page, pageSize, search, status, business`.
- **Queries** (`lib/queries`) use centralised keys (`queries/keys.ts`), `staleTime` 1 min for lists and 10 min for reference data, and `keepPreviousData` for pagination. Mutations invalidate their collection and show a toast. Moving a card is optimistic.
- Change the backend contract in `constants/endpoints.ts` and `types/`; no component needs editing.

## Icons

Icons come from Lucide via Iconify, mapped to the Untitled-UI names used in Figma (`constants/icons.ts`). They are bundled offline. After adding an icon, run `npm run icons`.

## Notes / to do

- Design source: the Figma MCP plan limit was reached after these frames were inspected in full: Dashboard, the four CRM tabs, Project & Board, Board Detail (edit / multi-account / viewer) and the Create Board, Share Board and Change Visibility popups. The Sales, Invoices, Finance, HR and Settings screens and the "Add New …" forms were built from the file's layer structure (frame names, sizes, form field counts and visible text) using the same components. Compare these against Figma and adjust column and field labels in the route files and `constants/forms.ts` if they differ.
- `static/images/logo.png` and the avatars were taken from Figma renders. Replace the logo with the original export for full sharpness.
- `adapter-auto` is configured. Switch to `adapter-node`, `adapter-static` or your platform's adapter in `vite.config.ts`.
- Auth: the sign-out item in the account menu is a placeholder for your auth provider.
