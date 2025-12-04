// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

// Carrega o .env explicitamente
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });

// Com engineType="library", podemos usar 'datasources' para forçar a URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Conectando ao MongoDB...");
  const email = "admin@gdash.com";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("⚠️ Admin já existe:", email);
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

  console.log("🚀 Admin criado com sucesso:", email);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });