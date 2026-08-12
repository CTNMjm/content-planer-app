# Dev-Log — content-planer-app

## 2026-08-12 (Teil 3) — Deployment auf Coolify reparieren (Next-16-Build)

Nach dem Push blieb `dev.cp-app.control-monitor.de` auf **HTTP 503**. Deployment läuft auf **Coolify** (Server 138.199.166.94, Build via nixpacks, Routing/TLS via Traefik) — **nicht** über GitHub Actions (`ci.yml` testet nur). Der zuletzt live gelaufene Container war ein uralter Stand (**Next 14.1.4**, noch mit `swcMinify:false`), d.h. Coolify hatte monatelang keinen neuen Build gezogen; Auto-Deploy per Git-Webhook ist zwar aktiv, aber jeder neue Build schlug fehl.

### Zwei Build-Fehler, nacheinander behoben
1. **`Cannot find module 'autoprefixer'`** — Coolify baut mit `NODE_ENV=production`, dadurch ließ `npm ci` die devDependencies weg (Coolify warnt explizit davor; `NPM_CONFIG_PRODUCTION=false` wird von npm 10 ignoriert). → **Fix:** `nixpacks.toml` Install-Cmd auf `npm ci --include=dev`. Lokal reproduziert/verifiziert. **Nötig, aber nicht hinreichend.**
2. Nächster Build: gleicher `autoprefixer`-Fehler, obwohl jetzt installiert (595 statt 295 Pakete). Ursache war **nicht** mehr die Installation, sondern **Turbopack**: dessen PostCSS-Plugin-Auflösung scheitert in Coolifys containerisierter nixpacks-Umgebung. Der Turbopack-Produktions-Build (Default in Next 16) ist in Container-Builds generell instabil — in einem sauberen `node:22-bookworm`-Container reproduziert derselbe Build sogar einen **V8-Absturz** (`V8_Fatal` im Turbopack-Compiler, verwandt mit dem früher notierten WSL-SIGTRAP). → **Fix:** Build zurück auf **Webpack** (`next build --webpack`), die bis Next 14 genutzte, stabile Pipeline. Im `node:22`-Container verifiziert: Turbopack-Build crasht, `--webpack` baut grün.

### Sicherheitsfund aus den Coolify-Logs
Die Coolify-Build-Env enthält Secrets im Klartext (in Logs sichtbar): `NEXTAUTH_SECRET`, `DATABASE_URL`-Passwort, `ADMIN_RESET_TOKEN` → **rotieren**. `JWT_SECRET` und `ADMIN_IMPORT_SECRET` sind **obsolet** (zugehöriger Code/Routen beim Audit entfernt) → in Coolify **löschen**. Optional: `NODE_ENV` in Coolify auf „Runtime only" stellen (dann greift auch der `--include=dev`-Trigger nicht mehr).

### Merke fürs Deployment
- Build-Pipeline ist **Webpack**, nicht Turbopack (`package.json` build-Script). Nicht versehentlich zurückdrehen.
- Coolify-Install nutzt `npm ci --include=dev` (nötig wegen `NODE_ENV=production` im Build).

## 2026-08-12 (Teil 2) — Lokale Audit- & Lasttests gegen den Next-16-Build

Vor dem Push/Deployment: Produktions-Build (`next start`) gegen eine frische Docker-Postgres (Port 5433, damit die vielen anderen lokalen DB-Container auf 5432 unberührt bleiben) mit Seed-Daten getestet — 2 Standorte (Berlin/Hamburg), Admin + je 1 standortgebundener User + 1 deaktivierter User, je 1 ContentPlan/InputPlan/RedakPlan pro Standort.

### Autorisierungs-Audit (echte Logins via NextAuth-Credentials) — 27/27 PASS
- **Login/Session:** Berlin-, Hamburg-, Admin-Login je erfolgreich; **deaktivierter User (`isActive=false`) wird abgewiesen** (keine Session).
- **Location-Scoping der Listen:** Berlin-User sieht in `content-plans`/`inputplan`/`redakplan`/`locations` jeweils genau 1 Eintrag (nur Berlin); Admin sieht überall 2.
- **IDOR (Berlin-User → Hamburg-Objekte) = 403** für GET ContentPlan/InputPlan/RedakPlan, alle drei History-Routen, DELETE ContentPlan und CSV-Export mit fremder `locationId`.
- **Positiv:** eigener Standort → 200 (inkl. Export); **Admin** → 200 auf beide Standorte.
- **Anonym → 401** auf die API-Listen.

### Lasttest (Node-Bordmittel, Produktions-Build)
- **30 gleichzeitig, 5s/Endpunkt:** 0 Fehler. Login-Seite ~2.700 req/s (p95 18ms); DB-Endpunkte ~1.000–1.400 req/s (p50 ~25ms, p99 ~40ms).
- **100 gleichzeitig, 8s/Endpunkt:** 0 Fehler, keine 500er/Abbrüche. DB-Endpunkte ~1.200–1.400 req/s, p50 ~77ms / p99 ~110ms — Latenz skaliert linear, kein Einbruch. Server-Log über ~150.000 Requests ohne eine einzige Fehler-/Warnzeile; danach weiterhin erreichbar.

**Fazit:** Auth-Grenzen greifen unter realen Sessions wie beabsichtigt, der Next-16-Build ist stabil und performant. Testartefakte (Docker-Container, Test-Skripte, Seed) wurden nach dem Lauf wieder entfernt; das Einmal-Migrationsskript `scripts/next15-params.sh` (async-params) ist erledigt und gelöscht.

## 2026-08-12 — Upgrade auf Next.js 16 + React 19

### Versionen
- **next 14.2.35 → 16.3.0** (Build jetzt via Turbopack), **react/react-dom 18.2 → 19.2.8**, **next-auth 4.24.7 → 4.24.15** (unterstützt Next 16 offiziell).
- Mitgezogen wegen React-19-Peer-Deps: **@headlessui/react 1.7 → 2.x** (Dialog/Transition-API abwärtskompatibel, keine Codeänderung nötig), **lucide-react 0.344 → aktuell**, @types/react[-dom] 19, @types/node 22, **eslint 8 → 9** + eslint-config-next 16.
- Zunächst war Next 15.5 geplant — dort bleiben aber gebündelte `postcss`/`sharp`-Advisories offen, erst 16.3.0 ist sauber. **`npm audit`: 0 Schwachstellen** (vorher 5 hoch).

### Breaking Changes umgesetzt
1. **Async `params`** in Route-Handlern: alle 22 dynamischen Handler auf `context: { params: Promise<…> }` + `await context.params` umgestellt (Skript `scripts/next15-params.sh`); Tests entsprechend auf `Promise.resolve(…)` angepasst.
2. **`middleware.ts` → `proxy.ts`**: Konvention in Next 16 umbenannt. Zusätzlich brach der bisherige Re-Export (`export { default } from "next-auth/middleware"`) unter Turbopack ("must export a function") → jetzt expliziter `withAuth({})`-Export in `src/proxy.ts`, Matcher unverändert.
3. **`next lint` entfernt** → per offiziellem Codemod auf ESLint-9-CLI migriert: `eslint.config.mjs` (Flat Config mit `eslint-config-next/core-web-vitals`), `.eslintrc.json` gelöscht, Script `lint: "eslint ."`. CI ruft weiterhin `npm run lint` auf.
4. `tsconfig.json` von Next automatisch angepasst (`jsx: react-jsx`, Include für `.next/dev/types`).

### Neue Lint-Regeln (react-hooks v6)
eslint-plugin-react-hooks v6 meldet 33 Verstöße in Bestandskomponenten (`set-state-in-effect`, `immutability` = Zugriff vor Deklaration, `static-components` = Pagination-Komponenten im Render). **Vorerst auf `warn` gestuft** (`eslint.config.mjs`) — das sind reale, aber nicht neue Qualitätsprobleme; Refactoring als eigener Schritt.

### Verifikation
`tsc --noEmit` 0 Fehler · ESLint 0 Fehler / 33 Warnungen (s. o.) · 22/22 Vitest-Tests grün · Produktions-Build OK (Turbopack, deutlich schneller: Compile <1s statt ~30s) · Smoke-Test komplett grün (CSS-Check an Turbopack-Pfade `/_next/static/chunks/*.css` angepasst).

### Fürs Deployment beachten
- Node ≥ 20.9 nötig — Docker/nixpacks stehen bereits auf Node 22, kein Handlungsbedarf.
- `middleware.ts` existiert nicht mehr; falls Deployment-Skripte darauf verweisen: heißt jetzt `src/proxy.ts`.

### Offene Punkte (aktualisiert)
1. 33 react-hooks-Warnungen refactoren (setState-in-Effect-Muster, Pagination-Komponenten aus dem Render ziehen).
2. Playwright-E2E-Tests auf Basis einer Seed-DB.
3. `NEXTAUTH_SECRET` für Produktion rotieren; Secrets ins Deployment-Secret-Management.
4. Feingranulare Permissions (`content.approve` etc.) serverseitig durchsetzen.
5. Prisma 6.11 → 6.19 (Minor-Update, unkritisch).

## 2026-08-11 (Teil 3) — Tests, CI und ESLint-Warnungen

### Tests (Vitest)
- **Vitest** als Dev-Dependency eingerichtet (`vitest.config.mts`, `@`-Alias auf `src/`, Node-Environment). Scripts: `npm test` (einmalig) / `npm run test:watch`.
- **22 Tests in `tests/`**, Fokus auf die frisch eingebaute Autorisierung:
  - `location-access.test.ts`: `getSessionUser`, `getAllowedLocationIds` (Admin-Bypass, leere Zuweisungen), `canAccessLocation` (Zuweisung/fremd/leere ID), `locationScope`.
  - `api-authorization.test.ts`: Route-Handler direkt aufgerufen (Prisma + next-auth gemockt) — `GET /api/inputplan` 401/Scoping/Admin, `GET|DELETE /api/content-plans/[id]` 401/403/404 und Erfolgsfälle inkl. „DELETE fremder Standort löscht nicht".
- Playwright-E2E bewusst noch nicht — braucht DB-Seeding + Browser-Setup, als eigener Schritt sinnvoller.

### CI (GitHub Actions)
- `.github/workflows/ci.yml`: Push auf `main` + Pull Requests → Node 22, `npm ci`, `tsc --noEmit`, `next lint`, `vitest run`, `next build` (mit Dummy-`DATABASE_URL`/`NEXTAUTH_SECRET`, es wird keine DB verbunden).

### ESLint
- Alle 4 verbliebenen `react-hooks/exhaustive-deps`-Warnungen behoben (`ContentPlanHistory`, `ContentPlanModal`, `InputPlanHistory`, `RedakPlanList`): Fetch-Funktionen in `useCallback` gehoben und in die Dependency-Arrays aufgenommen; dabei Debug-`console.log`s entfernt. In `ContentPlanModal` setzte `fetchLocations` die Standard-`locationId` doppelt (macht bereits der `locationsState`-Effect) → Duplikat entfernt.
- `next lint`: **0 Fehler, 0 Warnungen**.

### Verifikation
`tsc --noEmit` 0 Fehler · `next lint` sauber · 22/22 Tests grün · Produktions-Build OK · Smoke-Test komplett grün (inkl. 401-Checks).

### Offene Punkte (aktualisiert)
1. Next.js 15/16 + React 19 Upgrade (5 Rest-Advisories).
2. Playwright-E2E-Tests (Login-Flow, Plan-Lebenszyklus) auf Basis einer Seed-DB.
3. `NEXTAUTH_SECRET` für Produktion rotieren; Secrets ins Deployment-Secret-Management.
4. Feingranulare Permissions (`content.approve` etc.) serverseitig durchsetzen; JWT-Rolle wird 7 Tage gecacht.

## 2026-08-11 (Teil 2) — Location-Permissions serverseitig durchgesetzt

### Ausgangslage
Nachaudit der Autorisierung ergab: **Keine einzige API-Route prüfte Location-Permissions.** Das Datenmodell (`UserLocation` pro User+Standort) war vollständig vorhanden, wurde aber serverseitig nirgends zur Zugriffskontrolle benutzt. Zusätzlich war `GET /api/inputplan` **komplett ohne Auth** erreichbar (Middleware schützt keine `/api/*`-Pfade).

### Umsetzung
- **Neuer zentraler Helper `src/lib/location-access.ts`**: `getSessionUser()`, `getAllowedLocationIds()` (liest `UserLocation` aus der DB, globaler `ADMIN` sieht alles), `canAccessLocation()`, `locationScope()` für Prisma-where. Die alte, defekte und ungenutzte `src/lib/auth-helpers.ts` (las nie befüllte Session-Relationen, falscher Feldname) wurde gelöscht.
- **Kritisch behoben:** `GET /api/inputplan` verlangt jetzt Session + Location-Scope (war öffentlich, gab alle Pläne aller Standorte zurück).
- **Listen-Routen gescopt:** `content-plans` GET, `inputplan` GET, `redakplan` GET, `locations` GET (nur noch zugewiesene aktive Standorte; vorher alle; außerdem 401 statt `200 []` ohne Session).
- **Objekt-Routen geprüft:** `content-plans/[id]` GET/PUT/DELETE, `inputplan/[id]` GET/PUT/PATCH/DELETE, `redakplan/[id]` GET/PUT/DELETE, alle drei `history`-Routen, `automate`, `copy-to-redak`, `copy-to-input`, `contentplan/export` + `import` — jeweils: Objekt-Location gegen `UserLocation` geprüft (403), bei Verschieben zusätzlich Ziel-`locationId` validiert.
- **Mass-Assignment eingedämmt:** `POST /api/inputplan` und PUT/PATCH strippen jetzt `id`/`createdAt`/`deletedAt`/`deletedById`/`createdById`/`updatedById`; CSV-Import nur noch mit Feld-Whitelist.
- **Login:** `isActive` wird jetzt in `authorize()` geprüft — deaktivierte User können sich nicht mehr einloggen (wirkte vorher gar nicht).
- **Nebenbei:** doppelte `new PrismaClient()`-Instanz in `copy-to-redak` entfernt (nutzt `@/lib/prisma`), Debug-Logging (Header/Cookies/Bodies) aus den Routen entfernt.

### Verhaltensänderungen (beabsichtigt, aber sichtbar)
1. **`GET /api/redakplan`** zeigt jetzt alle Pläne der eigenen Standorte statt nur selbst erstellte (`createdById`-Filter ersetzt — Kollegen am selben Standort sahen vorher nichts, per ID-Zugriff aber doch alles; jetzt konsistent Location-basiert).
2. **User ohne `UserLocation`-Zuweisung (und ohne globale `ADMIN`-Rolle) sehen keine Standorte/Pläne mehr.** Vor dem Produktiv-Deployment prüfen, dass alle aktiven User Standort-Zuweisungen haben.
3. Das granulare `Permission`-/`UserLocationRole`-Modell (z. B. `content.approve`) wird weiterhin nur client-seitig für die UI benutzt — serverseitig wird auf Standort-Ebene autorisiert. Feingranulare Aktions-Rechte serverseitig durchzusetzen bleibt offen.

### Verifikation
`tsc --noEmit` 0 Fehler · `next lint` 0 Fehler / 5 bekannte Warnungen · Produktions-Build OK · Smoke-Test erweitert (`scripts/smoke-test.sh`): alle Plan-/Location-APIs ohne Login → 401, Export → 307 via Middleware, Rest wie gehabt grün.

### Offene Punkte (aktualisiert)
1. Next.js 15/16 + React 19 Upgrade (5 Rest-Advisories).
2. Tests (Vitest + Playwright) und CI.
3. `NEXTAUTH_SECRET` für Produktion rotieren; Secrets ins Deployment-Secret-Management.
4. ESLint-Warnungen (useEffect-Deps) beheben.
5. Feingranulare Permissions (`content.approve` etc.) serverseitig durchsetzen; JWT-Rolle wird 7 Tage gecacht (Rollenentzug greift verzögert).

## 2026-08-11 — Technisches Audit, Security-Check & Modernisierung

### Ausgangslage
- Next.js 14.1.4 (App Router), next-auth 4.x (Credentials + JWT-Session), Prisma 6 / PostgreSQL, Tailwind, Docker/Traefik-Deployment (dev.cp-app.control-monitor.de).
- Keine Tests, kein CI, Linting war defekt konfiguriert (Flat-Config mit ESLint 8 → `next lint` lief nie).
- 23 npm-Schwachstellen (3 kritisch, 15 hoch), u. a. **CVE-2025-29927** (Next.js-Middleware-Auth-Bypass: kompletter Login-Schutz per Header umgehbar).

### Audit-Befunde (Security)
| Schwere | Befund | Status |
|---|---|---|
| Kritisch | Next.js 14.1.4 Middleware-Auth-Bypass (CVE-2025-29927) | ✅ behoben (Update 14.2.35) |
| Kritisch | next-auth & form-data mit kritischen Advisories | ✅ behoben (npm audit fix) |
| Hoch | `api/inputplan/[id]/history` & `api/redakplan/[id]/history` komplett ohne Auth (leakten Namen/E-Mails) | ✅ Session-Pflicht ergänzt |
| Hoch | Admin-Routen (`admin-import`, `admin-check`, `admin-fix-locations`) nur durch schwaches Query-Secret geschützt; `admin-import` führte rohes SQL aus | ✅ Routen entfernt |
| Hoch | Tailwind wurde zur Laufzeit von `cdn.tailwindcss.com` geladen (Supply-Chain-/Perf-Risiko, nicht produktionstauglich) | ✅ auf Build-Kompilierung umgestellt |
| Mittel | Debug-Endpoints (`/debug`, `/test-permissions`, `api/debug/session`) und toter JWT-Legacy-Code (`api/auth/verify`, JWT-Fallbacks mit nicht existentem `JWT_SECRET`) | ✅ entfernt |
| Mittel | Dev-User-Backdoor in `inputplan/[id]` & `redakplan/[id]` (erster DB-User ohne Login im Dev-Modus) | ✅ entfernt |
| Mittel | Offene Selbstregistrierung unter `/api/register` | ✅ per Env-Flag `ALLOW_REGISTRATION` steuerbar (Standard: **aus**; lokal in `.env` auf `true` gesetzt — in Produktion bewusst setzen oder weglassen) |
| Mittel | DB-Dumps/Backups im Git (nur Demo-Daten, keine echten Hashes/Mails) | ✅ aus Repo entfernt, .gitignore ergänzt |
| Info | `.env` war nie committet (gesamte Historie geprüft). `ADMIN_IMPORT_SECRET` obsolet → aus `.env` entfernen/rotieren. | ✅ |

### Verbleibende npm-Schwachstellen
5 (hoch, keine kritischen): betreffen Next 14 selbst (DoS Image-Optimizer, Request-Smuggling bei Rewrites u. a.) sowie glob/postcss in Dev-Tooling. Vollständige Behebung erfordert **Major-Update auf Next.js 15/16 + React 19** → als eigenes Upgrade-Projekt einplanen.

### Qualität / Infrastruktur
- **Node:** Build stürzte mit Node 20.19.2 reproduzierbar ab (V8-Bug bei „Collecting build traces“ — vermutlich der Grund für die alten Workarounds `swcMinify:false`/`minimize:false`). Mit Node 22 baut alles sauber → `.nvmrc`, `engines`, Docker & nixpacks auf Node 22 gehoben, Minifizierung wieder aktiviert.
- **Deployment:** nixpacks startete den **Dev-Server** in Produktion und baute nie (`npm run dev`, kein `next build`); Dockerfile.dev ignorierte Build-Fehler (`|| true`). Beides korrigiert.
- **Aufgeräumt:** Backup-Dumps, doppelte Configs (3× postcss, 2× tailwind, eslint.config.mjs), `*.backup`-Dateien, `migrations_backup/`, Test-Skripte im Root, kaputte Datei `s psql …` entfernt. Ungenutzte Dependencies `jsonwebtoken`, `pg` (+ Types) entfernt.
- **Verifikation:** `tsc --noEmit` 0 Fehler · ESLint 0 Fehler / 5 Warnungen (useEffect-Deps) · Produktions-Build OK · Smoke-Test der gebauten App OK (`bash scripts/smoke-test.sh`, nutzt Port 3100, da 3000 lokal belegt ist): Login-Seite 200 mit kompiliertem Tailwind-CSS, `/dashboard` ohne Login → 307 Redirect, History-API ohne Login → 401, Register-Validierung 400, alle Security-Header gesetzt.
- **Achtung, bekanntes Ärgernis:** Der Build kann unter WSL sporadisch mit einem V8-Absturz (`SIGTRAP`, „V8_Fatal“) im Minifier abbrechen — auf Node 20 wie 22, nicht deterministisch. Einfach erneut bauen. Die früheren Workarounds (`swcMinify:false`, `minimize:false`) stammten daher; sie sind jetzt entfernt, weil unminifizierte Produktions-Bundles der schlechtere Dauerzustand sind.

### Offene Punkte (Empfehlungen)
1. **Next.js 15/16 + React 19 Upgrade** (behebt die 5 Rest-Advisories).
2. **Tests einführen** (Vitest + Playwright empfohlen), danach CI (GitHub Actions: lint + tsc + build + test).
3. Rollen-/Rechtemodell serverseitig konsequent durchziehen (Location-Permissions werden nicht in allen Routen geprüft).
4. `NEXTAUTH_SECRET` für Produktion rotieren (lag lokal in `.env`); Secrets ins Deployment-Secret-Management.
5. ESLint-Warnungen (useEffect-Dependencies) beheben.
