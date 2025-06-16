const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFields() {
  try {
    // Erstelle einen Test-Eintrag um zu sehen welche Felder verfügbar sind
    console.log('Teste InputPlan Felder...');
    
    // Versuche die Felder zu lesen (auch wenn keine Daten da sind)
    const inputPlanCount = await prisma.inputPlan.count();
    console.log(`Anzahl InputPlan Einträge: ${inputPlanCount}`);
    
    // Prüfe ob wir auf neue Felder zugreifen können
    try {
      const testQuery = await prisma.inputPlan.findFirst({
        select: {
          id: true,
          monat: true,
          implementationLevel: true,
          creativeFormat: true,
          n8nResult: true,
          flag: true,
          voeDate: true
        }
      });
      console.log('✅ Neue Felder sind im Prisma Client verfügbar!');
    } catch (error) {
      console.log('❌ Fehler beim Zugriff auf neue Felder:', error.message);
    }
    
    console.log('\nTeste ContentPlan Felder...');
    const contentPlanCount = await prisma.contentPlan.count();
    console.log(`Anzahl ContentPlan Einträge: ${contentPlanCount}`);
    
  } catch (error) {
    console.error('Fehler:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFields();
