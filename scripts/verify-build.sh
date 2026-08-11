#!/usr/bin/env bash
# Verifikation: tsc + ESLint + Produktions-Build (Node 22 via nvm)
set -u
source ~/.nvm/nvm.sh
nvm use 22.21.1 >/dev/null

echo "=== tsc --noEmit ==="
npx tsc --noEmit
echo "tsc exit: $?"

echo "=== next lint ==="
npx next lint
echo "lint exit: $?"

echo "=== vitest ==="
npm test
echo "test exit: $?"

echo "=== next build ==="
npm run build
echo "build exit: $?"
