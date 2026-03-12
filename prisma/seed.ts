import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const clubs = [
  { name: "Curupayti", shortName: "CUR", logoPath: "/clubs/curupayti.svg" },
  { name: "Hurling Club", shortName: "HUR", logoPath: "/clubs/hurling.svg" },
  { name: "Lomas Athletic", shortName: "LOM", logoPath: "/clubs/lomas-athletic.svg" },
  { name: "San Luis", shortName: "SL", logoPath: "/clubs/san-luis.svg" },
  { name: "Olivos RC", shortName: "ORC", logoPath: "/clubs/olivos.svg" },
  { name: "Gimnasia y Esgrima (GEBA)", shortName: "GEBA", logoPath: "/clubs/geba.svg" },
  { name: "San Albano", shortName: "SAL", logoPath: "/clubs/san-albano.svg" },
  { name: "San Cirano", shortName: "SC", logoPath: "/clubs/san-cirano.svg" },
  { name: "Deportiva Francesa", shortName: "ADF", logoPath: "/clubs/deportiva-francesa.svg" },
  { name: "San Fernando", shortName: "CSF", logoPath: "/clubs/san-fernando.svg" },
  { name: "Pueyrredon", shortName: "PUEY", logoPath: "/clubs/pueyrredon.svg" },
  { name: "Universitario de la Plata", shortName: "UDLP", logoPath: "/clubs/universitario-lp.svg" },
  { name: "San Andres", shortName: "SAN", logoPath: "/clubs/san-andres.svg" },
  { name: "Pucara", shortName: "PUC", logoPath: "/clubs/pucara.svg" },
];

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.prediction.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.fecha.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.club.deleteMany({});

  console.log("Seeding clubs...");
  for (const club of clubs) {
    await prisma.club.create({ data: club });
  }

  const firstClub = await prisma.club.findFirst({ orderBy: { id: "asc" } });
  if (!firstClub) throw new Error("No clubs found after seed");

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      clubId: firstClub.id,
      isAdmin: true,
    },
  });

  console.log("\n✓ Seed completado.");
  console.log("  Admin: admin / admin123");
  console.log(`  Clubes cargados: ${clubs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
