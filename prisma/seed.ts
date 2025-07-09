// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
  const location = await prisma.location.create({
    data: { id: 'loc1', name: 'Test-Standort' }
  });

  const role = await prisma.userRole.create({
    data: { id: 'role1', name: 'Admin' }
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      id: 'admin-id',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN', // <-- wichtig!
      // weitere Pflichtfelder
    }
  });

  await prisma.userLocation.create({
    data: {
      userId: user.id,
      locationId: location.id,
      // ggf. weitere Pflichtfelder
    }
  });

  console.log('✅ Admin-User angelegt')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())