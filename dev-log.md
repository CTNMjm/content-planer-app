# Dev-Log — content-planer-app

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
