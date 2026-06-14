# D2 Rune Word Calculator
> Select the runes you have and instantly see every Diablo II rune word you can make.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack](#technology-stack)
4. [Environment Strategy](#environment-strategy)
5. [Pre-Flight Checklist](#pre-flight-checklist)
6. [Implementation Stories](#implementation-stories)
7. [Secrets & Config Management](#secrets--config-management)
8. [Definition of Done](#definition-of-done)

---

## Architecture Overview

```mermaid
flowchart TD
    DNS["d2runes.brandonlocke.xyz\n(Namecheap DNS)"]
    FLY["Fly.io Machine\nauto start/stop · min=0"]
    CADDY["Caddy\nserves static build"]
    DIST["dist/ — Vite build\nindex.html · assets/*.js,css\nrunewords.json · rune SVG icons"]

    DNS -->|"CNAME / A → Fly anycast"| FLY
    FLY --> CADDY
    CADDY --> DIST
```

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant App as Svelte App

    B->>App: Load index.html + assets
    B->>App: Fetch runewords.json
    U->>B: Toggle rune icon
    B->>App: selectedRunes updates
    App->>App: filterRunewords(runewords, selectedRunes)
    App-->>B: Re-render matching rune word list
```

### Key Design Decisions
- **Static-only architecture:** No backend/API. All filtering logic runs client-side against a bundled JSON config. This keeps the app trivial to host, scale to zero, and deploy.
- **Vite + Svelte:** Small bundle size, fast cold-start rendering, and a reactivity model that maps cleanly to "toggle rune → re-filter list" without extra state-management libraries.
- **Caddy as the static server:** Automatic HTTPS support and simple config, consistent with the broader template even though TLS termination for the custom domain happens via Fly certs.
- **Scale-to-zero on Fly.io:** `min_machines_running = 0` with `auto_stop_machines`/`auto_start_machines` keeps hosting costs near zero for a low-traffic hobby site.
- **Extensibility mechanism:** New or updated rune words are added entirely via `runewords.json` — no code changes required. Same for new rune icons (drop an SVG into `frontend/src/assets/runes/` and reference it by rune name).

---

## Repository Structure

```
d2-runeword-calculator/
├── README.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── Caddyfile
├── Caddyfile.prod
├── Makefile
├── .env.example               ← committed; .env is gitignored
├── fly.toml
│
└── frontend/                   ← Vite + Svelte
    ├── Dockerfile
    ├── public/                 ← MUST EXIST for Docker multi-stage build
    │   ├── .gitkeep
    │   └── runewords.json
    ├── src/
    │   ├── App.svelte
    │   ├── main.js
    │   ├── lib/
    │   │   ├── RuneSelector.svelte
    │   │   ├── RuneIcon.svelte
    │   │   ├── RunewordList.svelte
    │   │   ├── RunewordCard.svelte
    │   │   └── filter.js
    │   └── assets/
    │       └── runes/
    │           ├── el.svg
    │           ├── eld.svg
    │           └── ... (33 total)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Vite + Svelte | Small bundle, fast builds, simple reactivity for real-time filtering |
| Styling | CSS (scoped Svelte styles) | No extra framework needed for a single-page app |
| Data | `runewords.json` (static config) | New rune words/types added without code changes |
| Icons | Hand-authored SVG rune glyphs | No external asset dependencies or licensing concerns |
| Proxy | Caddy 2 | Automatic HTTPS, simple static file serving |
| Containers | Docker + Compose | Consistent across local/dev/prod |
| Hosting | Fly.io | Docker-native, scale-to-zero billing |
| DNS | Namecheap (direct → Fly anycast) | Domain already owned; no extra provider needed |
| CI/CD | Manual `fly deploy` via Makefile (GitHub Actions optional later) | Keep v1 simple |

---

## Environment Strategy

| | Local | Production |
|---|---|---|
| Domain | `localhost` | `d2runes.brandonlocke.xyz` |
| TLS | none | Fly-managed cert (Let's Encrypt) |
| Secrets | `.env` file (none required for v1) | Fly.io secrets (if needed later) |
| Deploy | `make dev` | `make deploy` (`fly deploy`) |
| Serving | Vite dev server or Caddy + local build | Caddy serving Vite production build |

---

## Pre-Flight Checklist

Run before first `docker compose build` and after any environment change:

```bash
# Docker is running
docker info > /dev/null && echo "✓ Docker running" || echo "✗ Docker not running"

# DNS works from Docker (if this fails, restart Docker daemon)
docker run --rm alpine nslookup registry-1.docker.io && echo "✓ Docker DNS ok"

# Required ports are free
lsof -i :80 -i :443 -i :5173 -i :8080 | grep LISTEN && echo "⚠ ports in use" || echo "✓ ports free"

# .env exists
test -f .env && echo "✓ .env found" || echo "✗ copy .env.example to .env"
```

If Docker DNS fails: `sudo systemctl restart docker` then re-run.

> **Ctrl+C not responding?** If `docker compose up` hangs on stop, your services are missing `stop_grace_period`. All services in `docker-compose.yml` should have `stop_grace_period: 5s`. Without it, Docker waits the full 10-second default before force-killing, and a stuck container can make the terminal unresponsive.

---

## Implementation Stories

### Story Template
Each story is one Claude CLI session. Keep them tight.

```
#### Story X.Y — Title
**Context:** What already exists. What this story builds on. (2-3 sentences max)
**Assumptions:**
- List explicit prerequisites — files, env vars, mounted volumes, running services
- If an assumption is wrong, the story will fail; fix the assumption first
**Tasks:**
- Imperative, specific, one action per bullet
- Include file paths
- Call out any SOLID principles or patterns to follow
**Out of Scope:**
- Anything that might tempt scope creep
**Acceptance Criteria:**
- [ ] Component-level: unit tests pass, binary builds, etc.
- [ ] Integration: `docker compose up` — all containers stay running
- [ ] At least one `curl` or browser check against the running stack
- [ ] No secrets committed; `.env` pattern followed
```

---

### Epic 1 — Foundation

**Epic Goal:** Stand up the project skeleton, build tooling, and the runewords data file so subsequent epics have a working base to build on.

#### Story 1.1 — Project Scaffold, Docker, and Makefile
**Context:** Empty repository. This is the first story; everything else builds on it.

**Assumptions:**
- Docker and Docker Compose are installed locally.
- Node.js 20+ is available for local (non-Docker) Vite tooling if needed.

**Tasks:**
- Scaffold a new Vite + Svelte project in `frontend/` (`npm create vite@latest frontend -- --template svelte`).
- Create `frontend/public/.gitkeep` to ensure the directory exists for Docker builds.
- Write `frontend/Dockerfile` as a multi-stage build: stage 1 builds the Vite app (`npm ci && npm run build`), stage 2 copies `dist/` into a Caddy image.
- Write `Caddyfile` (local) and `Caddyfile.prod` (production) — both simply serve static files from `/srv` with `file_server` and SPA fallback to `index.html`.
- Write `docker-compose.yml` defining a single `frontend` service: builds from `frontend/Dockerfile`, maps port 8080:80, mounts `Caddyfile`, sets `stop_grace_period: 5s`.
- Write `.env.example` (placeholder — no secrets needed yet, but establish the pattern).
- Write a `Makefile` with the following targets:
  - `dev` — runs `docker compose up --build`
  - `down` — runs `docker compose down`
  - `build` — runs `docker compose build`
  - `logs` — tails `docker compose logs -f`
  - `clean` — removes `node_modules`, `dist`, and stops containers
- Write the README.md skeleton (this file) into the repo root, committing the structure as-is.
- Add a root `.gitignore` (node_modules, dist, .env, .DS_Store).

**Out of Scope:**
- Any application logic, components, or styling beyond the Vite template default.
- Production fly.toml or deploy targets (Epic 3).
- runewords.json content (Story 1.2).

**Acceptance Criteria:**
- [ ] `npm install` and `npm run build` succeed inside `frontend/`.
- [ ] `make dev` builds and starts the container; `docker compose ps` shows the `frontend` service running.
- [ ] `curl http://localhost:8080` returns the default Vite + Svelte page HTML.
- [ ] `make down` cleanly stops the stack with no hung containers.
- [ ] No secrets committed; `.env.example` exists and `.env` is gitignored.

---

#### Story 1.2 — `runewords.json` Data File
**Context:** Builds on Story 1.1's scaffold. This story produces the single source of truth for all rune word data, consumed by the app in Epic 2.

**Assumptions:**
- `frontend/public/` exists (from Story 1.1).
- Data scope is Diablo II: Resurrected / Ladder-current LoD rune words (Classic-only rune words excluded).

**Tasks:**
- Create `frontend/public/runewords.json` containing an array of rune word objects, each with:
  - `name` (string)
  - `runes` (ordered array of rune names, e.g. `["Tal", "Thul", "Ortho", "Eth"]`)
  - `types` (array of applicable item types, e.g. `["Sword", "Shield"]`)
  - `sockets` (integer — number of sockets required)
  - `requiredLevel` (integer)
  - `description` (string — short flavor/summary text)
  - `stats` (array of strings — the bonuses granted)
- Populate the file with the full current LoD/Ladder rune word list (~40+ entries as of D2R's current ladder rune word set).
- Create a small validation script `frontend/scripts/validate-runewords.mjs` (or equivalent) that checks: every `runes` entry is a valid rune name, `sockets` matches `runes.length`, and required fields are present on every entry.
- Add a `make validate-data` target that runs this script via `node`.

**Out of Scope:**
- Classic-only rune words.
- Any UI to consume this file (Epic 2).
- Rune icon assets (Story 2.1).

**Acceptance Criteria:**
- [ ] `frontend/public/runewords.json` is valid JSON and contains all current LoD/Ladder rune words.
- [ ] `make validate-data` runs and passes with zero errors against the populated file.
- [ ] `docker compose up` still starts cleanly (file addition doesn't break the build).
- [ ] No secrets committed.

> **Gate — Epic 1 complete when:**
> - `make dev` serves a working (default-template) Vite + Svelte page via Caddy at `localhost:8080`.
> - `runewords.json` exists, validates cleanly, and contains the full LoD/Ladder rune word dataset.
> - All Makefile targets (`dev`, `down`, `build`, `logs`, `clean`, `validate-data`) work as described.

---

### Epic 2 — Core App

**Epic Goal:** Build the interactive rune selector and rune word list, with real-time client-side filtering.

#### Story 2.1 — Rune Icons & Rune Selector
**Context:** Builds on the scaffold (1.1) and data file (1.2). This story introduces the visual rune set and the selection UI.

**Assumptions:**
- `frontend/public/runewords.json` exists and lists valid rune names.
- Vite + Svelte dev server runs via `npm run dev` inside `frontend/`.

**Tasks:**
- Generate 33 SVG rune glyphs (El through Zod), styled as clean, simple Elder Futhark-inspired symbols on a transparent background, saved to `frontend/src/assets/runes/{runename}.svg` (lowercase filenames, e.g. `el.svg`, `eld.svg`, ... `zod.svg`).
- Create `frontend/src/lib/RuneIcon.svelte` — a component that takes a `rune` prop and renders the corresponding SVG, with a `selected` prop controlling a visual active/inactive state (e.g. border, glow, opacity).
- Create `frontend/src/lib/RuneSelector.svelte` — renders all 33 `RuneIcon` components in a grid, manages a `selectedRunes` Set, and toggles selection on click. Emits the updated set to the parent (`App.svelte`) via Svelte's reactive bindings/events.
- Wire `RuneSelector` into `App.svelte` and confirm clicking icons toggles their visual selected state.

**Out of Scope:**
- Runeword list rendering (Story 2.2).
- Filtering logic (Story 2.3).
- Final visual polish/responsive layout (Story 2.4).

**Acceptance Criteria:**
- [ ] All 33 rune SVGs exist under `frontend/src/assets/runes/` and render correctly.
- [ ] `RuneSelector.svelte` displays all 33 runes and toggling a rune visually marks it as selected/deselected.
- [ ] `make dev` — container stays running, no build errors.
- [ ] Browser check: load `localhost:8080`, click several rune icons, confirm selected state toggles correctly.

---

#### Story 2.2 — Rune Word List Component
**Context:** Builds on 1.2 (data) and 2.1 (selector exists but not yet wired to filtering). This story renders the full rune word list from `runewords.json`.

**Assumptions:**
- `frontend/public/runewords.json` is present and valid.
- `App.svelte` currently renders `RuneSelector` with no list below it.

**Tasks:**
- Create `frontend/src/lib/RunewordCard.svelte` — displays a single rune word's name, required runes (using `RuneIcon` for each), applicable item types, socket count, required level, description, and stats list.
- Create `frontend/src/lib/RunewordList.svelte` — fetches/imports `runewords.json` and renders a `RunewordCard` for each entry in a responsive grid/list.
- Wire `RunewordList` into `App.svelte`, placed below `RuneSelector`.
- Confirm all rune words from `runewords.json` render with correct data in each card.

**Out of Scope:**
- Filtering based on selected runes (Story 2.3) — at this stage, all rune words show unconditionally.
- Styling polish (Story 2.4).

**Acceptance Criteria:**
- [ ] `RunewordList.svelte` renders one `RunewordCard` per entry in `runewords.json`.
- [ ] Each card displays name, runes (as icons), types, sockets, required level, description, and stats.
- [ ] `make dev` — container stays running, no build/runtime errors.
- [ ] Browser check: load `localhost:8080`, confirm full rune word list renders below the rune selector.

---

#### Story 2.3 — Real-Time Filtering Logic
**Context:** Builds on 2.1 (rune selection state) and 2.2 (full list rendering). This story connects the two: the list filters in real time based on selected runes.

**Assumptions:**
- `App.svelte` holds (or can access) the `selectedRunes` state from `RuneSelector`.
- `RunewordList` currently renders all entries unconditionally.

**Tasks:**
- Create `frontend/src/lib/filter.js` exporting a pure function `filterRunewords(runewords, selectedRunes)`:
  - If `selectedRunes` is empty, return all rune words unchanged.
  - Otherwise, return only rune words whose `runes` array is a subset of `selectedRunes` (i.e., every required rune is in the user's selected set).
- Lift `selectedRunes` state to `App.svelte` (or a shared store) so both `RuneSelector` and `RunewordList` reactively read/update it.
- Update `RunewordList.svelte` to call `filterRunewords` and render only the matching subset, reactively, on every selection change.
- Add unit tests for `filter.js` covering: empty selection (returns all), exact match, superset match (user has extra runes), and no match (missing a required rune).

**Out of Scope:**
- Sorting or grouping of results (e.g. by item type) — out of scope unless explicitly requested later.
- Visual styling (Story 2.4).

**Acceptance Criteria:**
- [ ] `filter.js` unit tests pass (`npm run test` or equivalent).
- [ ] Selecting runes in the UI immediately narrows the displayed rune word list to only those achievable with the selected runes.
- [ ] Deselecting all runes restores the full list.
- [ ] `make dev` — container stays running, no build/runtime errors.
- [ ] Browser check: select a known rune combination (e.g. Tal + Thul + Ortho + Eth) and confirm "Spirit" appears; deselect and confirm full list returns.

---

#### Story 2.4 — Styling, Responsive Polish & Makefile Updates
**Context:** Builds on 2.1–2.3. Core functionality is complete; this story focuses on visual quality and dev ergonomics.

**Assumptions:**
- All components from 2.1–2.3 are functional and wired together.

**Tasks:**
- Apply scoped CSS styling across `App.svelte`, `RuneSelector.svelte`, `RunewordCard.svelte`, and `RunewordList.svelte` for a clean, readable layout (grid-based rune selector, card-based rune word list).
- Ensure responsive layout works on mobile widths (rune selector wraps, cards stack to single column).
- Add a visual indicator for the count of matching rune words (e.g. "Showing 6 of 42 rune words").
- Add `lint` and `format` Makefile targets (e.g. `npm run lint`, `npm run format` using ESLint/Prettier if configured, or document as no-op if not needed).
- Update `make dev` if any new dev dependencies require additional setup steps.

**Out of Scope:**
- New features or data changes.
- Deployment configuration (Epic 3).

**Acceptance Criteria:**
- [ ] App is visually coherent and usable at both desktop (1280px+) and mobile (375px) widths.
- [ ] Match count indicator updates correctly as selections change.
- [ ] New Makefile targets (`lint`, `format`) run without error.
- [ ] `make dev` — container stays running, no build/runtime errors.
- [ ] Browser check: resize browser window, confirm layout adapts without breaking.

> **Gate — Epic 2 complete when:**
> - `make dev` serves the full app via Caddy at `localhost:8080`.
> - Rune selector displays all 33 SVG rune icons and toggling works.
> - Rune word list renders all entries from `runewords.json` with correct data.
> - Selecting runes filters the list in real time (subset match); deselecting all shows the full list.
> - Layout is responsive and visually polished.
> - All Makefile targets (including `lint`, `format`, `validate-data`) work.

---

### Epic 3 — Deploy & Domain

**Epic Goal:** Ship the app to Fly.io with scale-to-zero behavior, and point `d2runes.brandonlocke.xyz` at it with valid HTTPS.

#### Story 3.1 — Production Docker, Fly Config, and Makefile Deploy Targets
**Context:** Builds on the completed Epic 2 app. This story prepares everything needed to deploy, but does not yet deploy.

**Assumptions:**
- `flyctl` is installed locally and authenticated (`fly auth login` already done by the user).
- `frontend/Dockerfile` builds a working production image locally (verified via `make build`).

**Tasks:**
- Confirm/finalize `frontend/Dockerfile` multi-stage build produces an optimized production image (Vite build output served by Caddy).
- Write `Caddyfile.prod` — production static file serving config (can mirror local `Caddyfile` if no differences are needed).
- Write `docker-compose.prod.yml` for local production-image testing (optional smoke test before deploy).
- Create `fly.toml` at the repo root:
  - App name (e.g. `d2runes`).
  - Set `[http_service]` with `internal_port` matching Caddy's listen port.
  - Set `auto_stop_machines = true`, `auto_start_machines = true`, `min_machines_running = 0`.
  - Set appropriate `[[vm]]` size (smallest available, e.g. `shared-cpu-1x`, 256MB).
- Add Makefile targets:
  - `deploy` — runs `fly deploy`
  - `fly-logs` — runs `fly logs`
  - `fly-status` — runs `fly status`

**Out of Scope:**
- Actually creating the Fly app or deploying (Story 3.2).
- DNS/domain configuration (Story 3.3).

**Acceptance Criteria:**
- [ ] `fly.toml` is valid (`fly config validate` passes, if app already exists — otherwise visually reviewed for correctness).
- [ ] `docker compose -f docker-compose.prod.yml up` (if used) builds and serves the production app locally.
- [ ] New Makefile targets (`deploy`, `fly-logs`, `fly-status`) are present and correctly invoke `flyctl` commands.
- [ ] No secrets committed.

---

#### Story 3.2 — Fly.io App Creation & First Deploy
**Context:** Builds on 3.1's `fly.toml` and Dockerfile. This story performs the actual first deployment to Fly.io.

**Assumptions:**
- `flyctl` is authenticated.
- `fly.toml` from Story 3.1 is present and reviewed.

**Tasks:**
- Run `fly launch` (or `fly apps create`) to register the app on Fly.io, using the app name from `fly.toml` — do not let `fly launch` overwrite the existing `fly.toml`/Dockerfile if prompted; reuse existing config.
- Run `make deploy` (`fly deploy`) to ship the first build.
- Verify the app is reachable at its default `<appname>.fly.dev` URL.
- Confirm scale-to-zero behavior: check `fly status` / `fly machine list` shows the machine stopping after a period of no traffic, and restarts on a new request.

**Out of Scope:**
- Custom domain / DNS (Story 3.3).
- Any application code changes.

**Acceptance Criteria:**
- [ ] `fly status` shows the app deployed and healthy.
- [ ] `curl https://<appname>.fly.dev` returns the app's HTML.
- [ ] Browser check: load `https://<appname>.fly.dev`, confirm full app (rune selector + filtering) works as in local testing.
- [ ] Machine scales down after idle period and back up on next request (observed via `fly machine list` / `fly status` before and after a period of inactivity).

---

#### Story 3.3 — Namecheap DNS & Custom Domain
**Context:** Builds on 3.2's deployed `.fly.dev` app. This story makes the app reachable at `d2runes.brandonlocke.xyz` with valid HTTPS.

**Assumptions:**
- The domain `brandonlocke.xyz` is registered and managed in Namecheap, and the user has access to its DNS settings.
- The app is live and reachable at `<appname>.fly.dev` (Story 3.2 complete).

**Tasks:**
- Run `fly certs add d2runes.brandonlocke.xyz` to register the custom domain with Fly and retrieve the required DNS target/records.
- In Namecheap's Advanced DNS settings for `brandonlocke.xyz`, add the record(s) Fly specifies for `d2runes` (typically a CNAME to the app's `.fly.dev` hostname, or an A/AAAA record to Fly's anycast IPs per `fly certs show`).
- Run `fly certs check d2runes.brandonlocke.xyz` to confirm certificate issuance status; wait for DNS propagation if needed.
- Verify HTTPS is fully working end-to-end.

**Out of Scope:**
- Any further application changes.
- Adding additional subdomains or redirects (e.g. `www.` variant) unless trivially included.

**Acceptance Criteria:**
- [ ] `fly certs check d2runes.brandonlocke.xyz` reports a valid, issued certificate.
- [ ] `curl https://d2runes.brandonlocke.xyz` returns the app's HTML with no TLS errors.
- [ ] Browser check: load `https://d2runes.brandonlocke.xyz`, confirm full app functionality (rune selection, real-time filtering) works correctly.
- [ ] Idle-then-request test: after a period of inactivity, loading the custom domain still successfully wakes the Fly machine and serves the app (may take a few seconds on cold start).

> **Gate — Epic 3 complete when:**
> - The app is live at `https://d2runes.brandonlocke.xyz` with a valid certificate.
> - The Fly machine scales to zero on idle and restarts on incoming traffic.
> - All Makefile targets (`deploy`, `fly-logs`, `fly-status`, plus all Epic 1/2 targets) work correctly.

---

## Secrets & Config Management

This project requires **no secrets** for v1 — it is a fully static site with no API keys, databases, or third-party integrations.

- `.env.example` is committed to establish the pattern for any future needs (e.g. analytics keys).
- `.env` is gitignored and unused in v1.
- Fly.io secrets (`fly secrets set`) are not required but documented here as the mechanism to use if a future story introduces any.

---

## Definition of Done

- [ ] All three epics' gates are met (see gate criteria within each epic).
- [ ] `runewords.json` contains the complete current LoD/Ladder rune word dataset and passes validation.
- [ ] Rune selector displays all 33 runes as custom SVG icons; selection toggles correctly.
- [ ] Rune word list filters in real time based on selected runes (subset match); empty selection shows all rune words.
- [ ] App is responsive on desktop and mobile.
- [ ] App is containerized, served via Caddy, and runs via `docker compose up` locally.
- [ ] App is deployed to Fly.io with `min_machines_running = 0` and confirmed to scale to zero on idle.
- [ ] App is reachable at `https://d2runes.brandonlocke.xyz` with a valid HTTPS certificate.
- [ ] All Makefile targets documented in this README work as described.
- [ ] No secrets committed anywhere in the repository.
