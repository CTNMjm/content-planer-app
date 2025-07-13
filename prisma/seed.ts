// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

import fs from 'fs';
import path from 'path';

async function main() {
  const dataPath = path.join(__dirname, 'seed-data.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  // Locations
  for (const location of data.locations) {
    await prisma.location.upsert({
      where: { id: location.id },
      update: location,
      create: location,
    });
  }

  // Users
  for (const user of data.users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          ...user,
          id: existing.id // Die ID bleibt erhalten, um Konflikte zu vermeiden
        }
      });
    } else {
      await prisma.user.create({ data: user });
    }
  }

  // ContentPlans
  for (const plan of data.contentPlans) {
    // Prüfe, ob alle referenzierten User existieren
    const userFields = ['createdById', 'updatedById', 'statusChangedById'];
    let missingUser = false;
    for (const field of userFields) {
      if (plan[field]) {
        const user = await prisma.user.findUnique({ where: { id: plan[field] } });
        if (!user) {
          console.warn(`⚠️  User mit ID ${plan[field]} für Feld ${field} existiert nicht. ContentPlan ${plan.id} wird übersprungen.`);
          missingUser = true;
          break;
        }
      }
    }
    if (missingUser) continue;

    await prisma.contentPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  // InputPlans
  for (const plan of data.inputPlans) {
    // Prüfe, ob der referenzierte ContentPlan existiert
    if (plan.contentPlanId) {
      const contentPlan = await prisma.contentPlan.findUnique({ where: { id: plan.contentPlanId } });
      if (!contentPlan) {
        console.warn(`⚠️  ContentPlan mit ID ${plan.contentPlanId} existiert nicht. InputPlan ${plan.id} wird übersprungen.`);
        continue;
      }
    }
    // Prüfe, ob alle referenzierten User existieren
    const userFields = ['createdById', 'updatedById', 'deletedById'];
    let missingUser = false;
    for (const field of userFields) {
      if (plan[field]) {
        const user = await prisma.user.findUnique({ where: { id: plan[field] } });
        if (!user) {
          console.warn(`⚠️  User mit ID ${plan[field]} für Feld ${field} existiert nicht. InputPlan ${plan.id} wird übersprungen.`);
          missingUser = true;
          break;
        }
      }
    }
    if (missingUser) continue;

    await prisma.inputPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  console.log('✅ Seed-Daten erfolgreich importiert');
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())