import { PrismaClient } from '@prisma/client'
import seedData from './seed-data.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Importiere Live-Daten (ohne Löschen)...')

  // Users
  for (const user of seedData.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    })
  }
  console.log(`✅ ${seedData.users.length} Users importiert/aktualisiert`)

  // Locations
  for (const location of seedData.locations) {
    await prisma.location.upsert({
      where: { id: location.id },
      update: location,
      create: location,
    })
  }
  console.log(`✅ ${seedData.locations.length} Locations importiert/aktualisiert`)

  // ContentPlans
  for (const plan of seedData.contentPlans) {
    await prisma.contentPlan.upsert({
      where: { id: plan.id },
      update: { ...plan, status: plan.status as any },
      create: { ...plan, status: plan.status as any },
    })
  }

  // InputPlans
  for (const plan of seedData.inputPlans) {
    await prisma.inputPlan.upsert({
      where: { id: plan.id },
      update: { ...plan, status: plan.status as any },
      create: { ...plan, status: plan.status as any },
    })
  }

  // RedakPlans
  for (const plan of seedData.redakPlans) {
    await prisma.redakPlan.upsert({
      where: { id: plan.id },
      update: { ...plan, status: plan.status as any },
      create: { ...plan, status: plan.status as any },
    })
  }
  console.log('🎉 Import abgeschlossen (ohne Löschen)!')
}

main()
  .catch((e) => {
    console.error('❌ Import fehlgeschlagen:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })