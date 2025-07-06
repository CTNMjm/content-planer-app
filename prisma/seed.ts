import { PrismaClient } from '@prisma/client'
import seedData from './seed-data.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Lösche existierende Daten (optional)
  await prisma.redakPlan.deleteMany()
  await prisma.inputPlan.deleteMany()
  await prisma.contentPlan.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // Importiere Users
  for (const user of seedData.users) {
    await prisma.user.create({
      data: {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    })
  }
  console.log(`✅ ${seedData.users.length} Users importiert`)

  // Importiere Locations
  for (const location of seedData.locations) {
    await prisma.location.create({
      data: {
        ...location,
        createdAt: new Date(location.createdAt),
        updatedAt: new Date(location.updatedAt)
      }
    })
  }
  console.log(`✅ ${seedData.locations.length} Locations importiert`)

  // Importiere ContentPlans
  for (const plan of seedData.contentPlans) {
    await prisma.contentPlan.create({
      data: {
        ...plan,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
        deletedAt: plan.deletedAt ? new Date(plan.deletedAt) : null
      }
    })
  }
  console.log(`✅ ${seedData.contentPlans.length} ContentPlans importiert`)

  // Importiere InputPlans
  for (const plan of seedData.inputPlans) {
    await prisma.inputPlan.create({
      data: {
        ...plan,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
        deletedAt: plan.deletedAt ? new Date(plan.deletedAt) : null,
        voe: plan.voe ? new Date(plan.voe) : null
      }
    })
  }
  console.log(`✅ ${seedData.inputPlans.length} InputPlans importiert`)

  // Importiere RedakPlans
  for (const plan of seedData.redakPlans) {
    await prisma.redakPlan.create({
      data: {
        ...plan,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
        deletedAt: plan.deletedAt ? new Date(plan.deletedAt) : null,
        voe: plan.voe ? new Date(plan.voe) : null
      }
    })
  }
  console.log(`✅ ${seedData.redakPlans.length} RedakPlans importiert`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
