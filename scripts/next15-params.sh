#!/usr/bin/env bash
# Next 15: params in Route-Handlern ist jetzt ein Promise.
# Minimal-invasive Umstellung: context.params awaiten, params.id-Nutzung bleibt.
set -eu

FILES=(
  "src/app/api/locations/[id]/route.ts"
  "src/app/api/users/[id]/route.ts"
  "src/app/api/content-plans/[id]/route.ts"
  "src/app/api/content-plans/[id]/history/route.ts"
  "src/app/api/contentplan/[id]/copy-to-input/route.ts"
  "src/app/api/redakplan/[id]/route.ts"
  "src/app/api/redakplan/[id]/history/route.ts"
  "src/app/api/inputplan/[id]/route.ts"
  "src/app/api/inputplan/[id]/history/route.ts"
  "src/app/api/inputplan/[id]/copy-to-redak/route.ts"
  "src/app/api/inputplan/[id]/automate/route.ts"
)

for f in "${FILES[@]}"; do
  perl -0777 -pi -e '
    # Mehrzeilige Signatur
    s/  \{ params \}: \{ params: \{ id: string \} \}\r?\n\) \{/  context: { params: Promise<{ id: string }> }\n) {\n  const params = await context.params;/g;
    # Einzeilige Signatur (req|request)
    s/(\w+): NextRequest, \{ params \}: \{ params: \{ id: string \} \}\) \{/$1: NextRequest, context: { params: Promise<{ id: string }> }) {\n  const params = await context.params;/g;
  ' "$f"
done

echo "Verbleibende synchrone params-Signaturen (erwartet 0):"
grep -rn 'params }: { params: { id: string } }' src/ | wc -l
echo "Umgestellte Handler:"
grep -rn 'await context.params' src/ | wc -l
