import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@dealroom.test";
  const password = "Demo123!";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Demo Founder",
      passwordHash,
    },
    create: {
      email,
      name: "Demo Founder",
      passwordHash,
    },
  });

  console.log("Demo user created:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });