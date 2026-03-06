# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build (also runs type generation)
npm run lint      # ESLint
npx tsc --noEmit  # type check only (no emit)
```

There are no tests. TypeScript check (`tsc --noEmit`) is the primary correctness gate before building.

The `aws/` directory has its own `aws/tsconfig.json` and is **excluded** from the root Next.js tsconfig. To type-check Lambda code separately, run `tsc` from inside `aws/` using that config.

## Architecture

### Data flow (current state: mock)
All API routes (`src/app/api/`) currently serve data from `src/lib/mockData.ts`. The intended production flow is:

```
Amazon Connect → S3 (transcript + .meta.json) → Lambda (process-transcript)
  → Claude API (claude-sonnet-4-6) → DynamoDB (CallInsights table)
  → API Gateway → Next.js API routes → Dashboard
```

When swapping to real AWS data, replace mock imports in `src/app/api/calls/route.ts`, `src/app/api/analytics/route.ts`, and `src/app/api/export/route.ts` with calls to the API Gateway URL (set via env var).

### Next.js app structure

- `src/app/(dashboard)/` — route group with shared sidebar+header layout. Layout is a **client component** because it holds the sidebar hover-expand state (`expanded: boolean`), passed down to `<Sidebar>` via props.
- `src/app/api/` — Next.js API routes acting as a BFF proxy. All filtering/pagination logic lives here today (backed by mock data arrays).
- `src/lib/types.ts` — single source of truth for all shared types. `CallRecord` is the central domain object.
- `src/lib/mockData.ts` — 20 realistic `CallRecord` objects + `getMockAnalytics()`. All `agentId` values follow the pattern `agent-00N`.

### Sidebar behaviour
The sidebar (`src/components/layout/Sidebar.tsx`) is icon-only (`w-14`) by default and expands to `w-60` on hover. It receives `expanded`, `onMouseEnter`, and `onMouseLeave` as props from the dashboard layout. The layout adjusts `marginLeft` via inline style (`56px` collapsed / `240px` expanded) with a 200ms CSS transition so the sidebar pushes content rather than overlaying it.

### Styling system
- **Tailwind CSS v4** with **shadcn/ui** — CSS variables defined in `src/app/globals.css` under `:root` and `.dark`.
- Primary color: indigo-600 (`oklch(0.546 0.245 264.4)`). All chart colors, badges, and active nav items derive from this.
- Sidebar uses `--sidebar-*` CSS variables. In light mode the sidebar is near-white; in dark mode it is deep navy. Do not hardcode sidebar colors in components — always use `bg-sidebar`, `text-sidebar-foreground`, etc.
- Dark mode is handled by `next-themes` (`ThemeProvider` in root layout with `attribute="class"`). The `.dark` class on `<html>` activates dark variables.
- Chart components (Recharts) reference CSS variables via `hsl(var(--primary))` / `oklch(...)` strings for automatic theme adaptation.

### AWS Lambda (not yet deployed)
Located in `aws/lambda/`:
- `process-transcript/` — S3-triggered Lambda. Reads transcript + `.meta.json` from S3, calls Claude API, writes to DynamoDB. Key file: `claude.ts` handles API call and schema validation. `prompt.ts` contains the structured JSON-output prompt.
- `api-handler/` — API Gateway Lambda. Queries DynamoDB using GSI1 (agentId + timestamp) for agent-filtered queries and scan for unfiltered.
- `aws/infrastructure/template.yaml` — SAM/CloudFormation template. DynamoDB table `CallInsights` has PK=`callId`, SK=`timestamp`, GSI1 on `agentId`+`timestamp`, GSI2 on `date`+`sentimentScore`.

### Key conventions
- `CallRecord.summary` is always a 3-tuple `[issue, outcome, flag]` — not a plain string array. Claude prompt enforces this; components destructure by index.
- Filters flow as `FilterState` (from `src/components/filters/FilterBar.tsx`) → hooks (`src/hooks/useCalls.ts`) → API params. `agentId: "all"` and `sentiment: "all"` mean no filter (not passed to API).
- Hooks (`src/hooks/`) are plain `useEffect`+`fetch` — no SWR or React Query.
- `cn()` from `src/lib/utils.ts` is the standard class merger (clsx + tailwind-merge).
- New shadcn components: run `npx shadcn@latest add <component> --overwrite` from the project root.
