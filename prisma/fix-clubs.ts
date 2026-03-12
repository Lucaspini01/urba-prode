import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.club.updateMany({
    where: { shortName: "UdlP" },
    data: { shortName: "UDLP" },
  });
  console.log(`✓ Clubes actualizados: ${result.count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
