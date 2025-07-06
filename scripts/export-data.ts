import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function exportData() {
  try {
    // Exportiere alle relevanten Daten
    const users = await prisma.user.findMany()
    const locations = await prisma.location.findMany()
    const contentPlans = await prisma.contentPlan.findMany()
    const inputPlans = await prisma.inputPlan.findMany()
    const redakPlans = await prisma.redakPlan.findMany()

    const data = {
      users,
      locations,
      contentPlans,
      inputPlans,
      redakPlans,
      exportDate: new Date().toISOString()
    }

    // Speichere als JSON
    fs.writeFileSync('prisma/seed-data.json', JSON.stringify(data, null, 2))
    console.log('✅ Daten exportiert nach prisma/seed-data.json')
  } catch (error) {
    console.error('❌ Export fehlgeschlagen:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
