# Dev-Log — content-planer-app

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
