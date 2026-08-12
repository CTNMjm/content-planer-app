#!/usr/bin/env bash
# Lokale, produktionsnahe Testumgebung aufsetzen:
# Docker-Postgres (Port 5433), .env.local, Schema, Admin-Login + Seed-Daten.
# Danach separat bauen/starten:  npm run build && PORT=3100 npm run start
# Aufraeumen:  docker rm -f cp-dev-db && rm .env.local
set -eu
cd "$(dirname "$0")/.."

source ~/.nvm/nvm.sh >/dev/null
nvm use 22.21.1 >/dev/null

# 1) Dev-DB (Port 5433, damit die anderen lokalen DBs auf 5432 unberuehrt bleiben)
if ! docker ps --format '{{.Names}}' | grep -q '^cp-dev-db$'; then
  docker rm -f cp-dev-db >/dev/null 2>&1 || true
  docker run -d --name cp-dev-db \
    -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres \
    -p 5433:5432 postgres:16 >/dev/null
fi
for i in $(seq 1 30); do
  docker exec cp-dev-db pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

# 2) .env.local (Vorrang vor .env, nicht committet). ALLOW_REGISTRATION=false wie in Prod.
cat > .env.local <<'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/postgres"
NEXTAUTH_URL="http://localhost:3100"
NEXTAUTH_SECRET="dev-only-secret-nicht-fuer-produktion"
ALLOW_REGISTRATION="false"
EOF

# 3) Schema in die DB
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/postgres"
npx prisma db push --skip-generate

# 4) Seed-Daten (Standorte + ContentPlans aus prisma/seed-data.json).
# Ueber "prisma db seed" (ts-node laut package.json) statt "npm run db:seed" (braucht tsx).
npx prisma db seed || echo "(Seed uebersprungen/teilweise – unkritisch fuers Durchklicken)"

# 5) Admin-Login mit bekanntem Passwort (sieht als ADMIN alle Standorte)
node -e '
  const {PrismaClient}=require("@prisma/client");const b=require("bcryptjs");
  (async()=>{const p=new PrismaClient();
    const pw=await b.hash("admin123",10);
    await p.user.upsert({where:{email:"admin@local.test"},
      update:{password:pw,role:"ADMIN",isActive:true},
      create:{email:"admin@local.test",name:"Lokaler Admin",password:pw,role:"ADMIN",isActive:true}});
    console.log("Admin bereit: admin@local.test / admin123");
    await p.$disconnect();})()'

echo ""
echo "Setup fertig. Jetzt bauen und starten:"
echo "  source ~/.nvm/nvm.sh && nvm use 22.21.1"
echo "  npm run build && PORT=3100 npm run start"
echo "Dann: http://localhost:3100/login  (admin@local.test / admin123)"
