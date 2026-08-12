#!/bin/bash
source ~/.nvm/nvm.sh >/dev/null
nvm use 22.21.1 >/dev/null
(PORT=3100 npm run start >/tmp/start.log 2>&1 &)
sleep 7
echo "--- /login status:"
curl -s -o /tmp/login.html -w "%{http_code}\n" http://localhost:3100/login
echo "--- css files referenziert:"
grep -o '/_next/static/[a-z]*/[a-zA-Z0-9._-]*\.css' /tmp/login.html | sort -u
CSS=$(grep -o '/_next/static/[a-z]*/[a-zA-Z0-9._-]*\.css' /tmp/login.html | head -1)
echo "--- tailwind utility in css (erwartet >=1):"
curl -s "http://localhost:3100$CSS" | grep -c 'flex{display:flex}'
echo "--- cdn script noch da? (erwartet 0):"
grep -c 'cdn.tailwindcss.com' /tmp/login.html
echo "--- /dashboard ohne login (erwartet 307/302):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/dashboard
echo "--- api history ohne login (erwartet 401):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/inputplan/test123/history
echo "--- api inputplan-liste ohne login (erwartet 401):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/inputplan
echo "--- api content-plans ohne login (erwartet 401):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/content-plans
echo "--- api locations ohne login (erwartet 401):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/locations
echo "--- api redakplan ohne login (erwartet 401):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/redakplan
echo "--- contentplan-export ohne login (erwartet 307 via Middleware):"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/contentplan/export?locationId=x&fields=monat"
echo "--- register mit leerem body (flag lokal an, erwartet 400 Validation):"
curl -s -X POST http://localhost:3100/api/register -H 'Content-Type: application/json' -d '{}' -o /tmp/reg.json -w "%{http_code}\n"
cat /tmp/reg.json; echo
echo "--- security headers:"
curl -s -I http://localhost:3100/login | grep -i -E 'x-frame|x-content|referrer|permissions'
pkill -f 'next start' >/dev/null 2>&1 || true
echo SMOKE_DONE
