import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Admin User erstellen (mit role Feld)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      role: "ADMIN",
    },
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Test User erstellen
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Test User",
      role: "USER",
    },
  });

  // Demo User erstellen
  const hashedPassword = await bcrypt.hash("demo123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
      role: "USER",
    },
  });

  // 2. Erstelle Demo-Locations
  const location1 = await prisma.location.upsert({
    where: { name: "Berlin Office" },
    update: {},
    create: {
      name: "Berlin Office",
      status: "ACTIVE",
    },
  });

  const location2 = await prisma.location.upsert({
    where: { name: "Hamburg Office" },
    update: {},
    create: {
      name: "Hamburg Office",
      status: "ACTIVE",
    },
  });

  // Locations erstellen
  const location3 = await prisma.location.upsert({
    where: { name: "Social Media" },
    update: {},
    create: {
      name: "Social Media",
      status: "ACTIVE",
    },
  });

  // UserRoles erstellen
  const adminRole = await prisma.userRole.upsert({
    where: { name: "LOCATION_ADMIN" },
    update: {},
    create: {
      name: "LOCATION_ADMIN",
      description: "Administrator für einen Standort",
    },
  });

  const userRole = await prisma.userRole.upsert({
    where: { name: "LOCATION_USER" },
    update: {},
    create: {
      name: "LOCATION_USER",
      description: "Normaler Benutzer für einen Standort",
    },
  });

  // Admin mit Hauptstandort verknüpfen
  const adminUserLocation = await prisma.userLocation.upsert({
    where: {
      userId_locationId: {
        userId: admin.id,
        locationId: location1.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      locationId: location1.id,
    },
  });

  // Admin-Rolle zuweisen
  await prisma.userLocationRole.upsert({
    where: {
      userLocationId_roleId: {
        userLocationId: adminUserLocation.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userLocationId: adminUserLocation.id,
      roleId: adminRole.id,
    },
  });

  // Permissions erstellen
  const adminPermissions = [
    "manage_all",
    "create_content",
    "edit_content",
    "delete_content",
    "publish_content",
  ];

  for (const permName of adminPermissions) {
    await prisma.permission.upsert({
      where: {
        userLocationId_name: {
          userLocationId: adminUserLocation.id,
          name: permName,
        },
      },
      update: {},
      create: {
        userLocationId: adminUserLocation.id,
        name: permName,
      },
    });
  }

  // Test-User mit Location verknüpfen
  const userUserLocation = await prisma.userLocation.upsert({
    where: {
      userId_locationId: {
        userId: user.id,
        locationId: location1.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      locationId: location1.id,
    },
  });

  // User-Rolle zuweisen
  await prisma.userLocationRole.upsert({
    where: {
      userLocationId_roleId: {
        userLocationId: userUserLocation.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userLocationId: userUserLocation.id,
      roleId: userRole.id,
    },
  });

  // User Permissions
  await prisma.permission.upsert({
    where: {
      userLocationId_name: {
        userLocationId: userUserLocation.id,
        name: "view_content",
      },
    },
    update: {},
    create: {
      userLocationId: userUserLocation.id,
      name: "view_content",
    },
  });

  // ========================================
  // CONTENT PLANS - Test-Daten
  // ========================================
  console.log("\n📝 Creating test content plans...");

  const contentPlans = [
    {
      monat: "2025-01",
      bezug: "Neujahr",
      mehrwert: "Neujahrsvorsätze und gesunde Ernährung",
      mechanikThema: "Social Media Kampagne",
      idee: "10 Tipps für einen gesunden Start ins neue Jahr",
      platzierung: "Instagram, Facebook",
      status: "COMPLETED" as const,
      locationId: location1.id,
      createdById: admin.id,
    },
    {
      monat: "2025-02",
      bezug: "Valentinstag",
      mehrwert: "Romantische Geschenkideen",
      mechanikThema: "Gewinnspiel",
      idee: "Gewinne ein romantisches Dinner für 2",
      platzierung: "Website, Newsletter",
      status: "APPROVED" as const,
      locationId: location1.id,
      createdById: admin.id,
    },
    {
      monat: "2025-03",
      bezug: "Frühlingsanfang",
      mehrwert: "Frühjahrsputz und Organisation",
      mechanikThema: "Blog-Serie",
      idee: "5-teilige Serie: Ordnung schaffen mit System",
      platzierung: "Blog, YouTube",
      status: "IN_PROGRESS" as const,
      locationId: location1.id,
      createdById: admin.id,
    },
    {
      monat: "2025-04",
      bezug: "Ostern",
      mehrwert: "Familienzeit und Traditionen",
      mechanikThema: "DIY-Anleitung",
      idee: "Osterdeko selbst gemacht - 3 einfache Ideen",
      platzierung: "Pinterest, Instagram",
      status: "DRAFT" as const,
      locationId: location1.id,
      createdById: admin.id,
    },
  ];

  const createdContentPlans = [];
  for (const plan of contentPlans) {
    const created = await prisma.contentPlan.create({
      data: plan,
    });
    createdContentPlans.push(created);
  }

  // ========================================
  // INPUT PLANS - Test-Daten
  // ========================================
  console.log("\n📋 Creating test input plans...");

  const inputPlans = [
    {
      contentPlanId: createdContentPlans[0].id,
      monat: "2025-01",
      bezug: "Neujahr",
      mehrwert: "Neujahrsvorsätze und gesunde Ernährung",
      mechanikThema: "Social Media Kampagne",
      idee: "10 Tipps für einen gesunden Start ins neue Jahr",
      platzierung: "Instagram, Facebook",
      status: "COMPLETED" as const,
      voe: new Date("2025-01-02"),
      zusatzinfo:
        "Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre",
      locationId: location1.id,
      createdById: admin.id,
    },
    {
      contentPlanId: createdContentPlans[1].id,
      monat: "2025-02",
      bezug: "Valentinstag",
      mehrwert: "Romantische Geschenkideen",
      mechanikThema: "Gewinnspiel",
      idee: "Gewinne ein romantisches Dinner für 2",
      platzierung: "Website, Newsletter",
      status: "IN_PROGRESS" as const,
      voe: new Date("2025-02-07"),
      zusatzinfo:
        "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.",
      locationId: location1.id,
      createdById: admin.id,
    },
  ];

  const createdInputPlans = [];
  for (const plan of inputPlans) {
    const created = await prisma.inputPlan.create({
      data: plan,
    });
    createdInputPlans.push(created);
  }

  // ========================================
  // REDAK PLANS - Test-Daten
  // ========================================
  console.log("\n📰 Creating test redak plans...");

  const redakPlans = [
    {
      inputPlanId: createdInputPlans[0].id,
      monat: "2025-01",
      bezug: "Neujahr",
      mechanikThema: "Social Media Kampagne",
      idee: "10 Tipps für einen gesunden Start ins neue Jahr",
      platzierung: "Instagram, Facebook",
      voe: new Date("2025-01-02"),
      status: "COMPLETED" as const,
      publiziert: true,
      locationId: location1.id,
      createdById: admin.id,
    },
  ];

  for (const plan of redakPlans) {
    await prisma.redakPlan.create({
      data: plan,
    });
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Test users:");
  console.log("  Admin: admin@example.com / admin123 (role: ADMIN)");
  console.log("  User: user@example.com / user123 (role: USER)");
  console.log("\n📍 Locations:", location1.name, ",", location2.name, ",", location3.name);
  console.log("\n🔐 System-Rollen: ADMIN, USER");
  console.log("🏢 Location-Rollen:", adminRole.name, ",", userRole.name);
  console.log("\n📝 Content Plans: 4 erstellt");
  console.log("📋 Input Plans: 2 erstellt");
  console.log("📰 Redak Plans: 1 erstellt");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });