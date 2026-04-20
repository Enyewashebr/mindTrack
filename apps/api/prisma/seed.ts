import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@mindtrack.app" },
    update: {},
    create: {
      email: "demo@mindtrack.app",
      fullName: "MindTrack Demo"
    }
  });

  console.log("Seed complete.");
  console.log(`Demo user id: ${demoUser.id}`);
  console.log(`Demo user email: ${demoUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
