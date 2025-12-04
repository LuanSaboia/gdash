// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gdash.com";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Admin já existe:", email);
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "admin",
    },
  });

  console.log("Admin criado com sucesso:", email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
