import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hole ersten User und erste Location
  const firstUser = await prisma.user.findFirst();
  const firstLocation = await prisma.location.findFirst();

  if (!firstUser || !firstLocation) {
    console.error('Kein User oder Location gefunden!');
    return;
  }

  const testPlans = [
    { monat: '2024-01', bezug: 'Neujahr 2024', mehrwert: 'Gesundheitstipps für den Start', mechanikThema: 'Neujahrsvorsätze', idee: 'Fitness-Challenge für Mitarbeiter', platzierung: 'Intranet + Newsletter', status: 'APPROVED' },
    { monat: '2024-02', bezug: 'Valentinstag', mehrwert: 'Teamzusammenhalt stärken', mechanikThema: 'Wertschätzung', idee: 'Dankeschön-Aktion für Kollegen', platzierung: 'Social Media + Plakate', status: 'IN_PROGRESS' },
    { monat: '2024-03', bezug: 'Frühlingsanfang', mehrwert: 'Motivation und Aufbruch', mechanikThema: 'Nachhaltigkeit', idee: 'Green Office Initiative', platzierung: 'Intranet + E-Mail', status: 'DRAFT' },
    { monat: '2024-04', bezug: 'Ostern', mehrwert: 'Work-Life-Balance', mechanikThema: 'Familienfreundlichkeit', idee: 'Oster-Event für Mitarbeiterkinder', platzierung: 'Newsletter + Flyer', status: 'APPROVED' },
    { monat: '2024-05', bezug: 'Tag der Arbeit', mehrwert: 'Mitarbeiteranerkennung', mechanikThema: 'Erfolgsgeschichten', idee: 'Mitarbeiter des Monats Feature', platzierung: 'Intranet + Social Media', status: 'COMPLETED' },
    { monat: '2024-06', bezug: 'Sommeranfang', mehrwert: 'Gesundheit am Arbeitsplatz', mechanikThema: 'Sommerfitness', idee: 'Bike-to-Work Challenge', platzierung: 'App + Newsletter', status: 'IN_PROGRESS' },
    { monat: '2024-07', bezug: 'Urlaubszeit', mehrwert: 'Erholung und Produktivität', mechanikThema: 'Urlaubstipps', idee: 'Vacation Sharing Platform', platzierung: 'Intranet + Blog', status: 'DRAFT' },
    { monat: '2024-08', bezug: 'Back to Work', mehrwert: 'Wissensvermittlung', mechanikThema: 'Weiterbildung', idee: 'Summer School Programm', platzierung: 'E-Mail + Webinar', status: 'APPROVED' },
    { monat: '2024-09', bezug: 'Herbstbeginn', mehrwert: 'Innovation fördern', mechanikThema: 'Ideenwettbewerb', idee: 'Innovation Challenge 2024', platzierung: 'Alle Kanäle', status: 'IN_PROGRESS' },
    { monat: '2024-10', bezug: 'Halloween', mehrwert: 'Teambuilding', mechanikThema: 'Kreativität', idee: 'Kostümwettbewerb im Büro', platzierung: 'Social Media + Fotos', status: 'DRAFT' }
  ];

  for (const plan of testPlans) {
    await prisma.contentPlan.create({
      data: {
        ...plan,
        locationId: firstLocation.id,
        createdById: firstUser.id,
        updatedById: firstUser.id,
      },
    });
  }

  console.log('10 Test-ContentPlans erstellt!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });