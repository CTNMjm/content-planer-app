#!/usr/bin/env bash
# Startet den bereits gebauten Produktions-Build auf Port 3100 (liest .env.local).
set -u
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null
nvm use 22.21.1 >/dev/null
export PORT=3100
exec npm run start
