import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { addDays, subDays } from "date-fns";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/mkops_licenses" });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const now = new Date();

  await db.license.deleteMany(); // clean slate

  const seeds = [
    {
      mkAuthAddress: "192.168.1.10",
      clientName: "Empresa Ativa (60 dias)",
      status: "active",
      activatedAt: subDays(now, 30),
      expiresAt: addDays(now, 60),
    },
    {
      mkAuthAddress: "192.168.1.20",
      clientName: "Empresa Expirando (3 dias)",
      status: "active",
      activatedAt: subDays(now, 90),
      expiresAt: addDays(now, 3),
    },
    {
      mkAuthAddress: "192.168.1.30",
      clientName: "Empresa em Período de Graça",
      status: "expired",
      activatedAt: subDays(now, 100),
      expiresAt: subDays(now, 2), // expirou há 2 dias → ainda na graça (7 dias)
    },
    {
      mkAuthAddress: "192.168.1.40",
      clientName: "Empresa Totalmente Expirada",
      status: "expired",
      activatedAt: subDays(now, 200),
      expiresAt: subDays(now, 10), // expirou há 10 dias → fora da graça
    },
    {
      mkAuthAddress: "192.168.1.50",
      clientName: "Empresa Suspensa",
      status: "suspended",
      activatedAt: subDays(now, 60),
      expiresAt: addDays(now, 300),
    },
  ];

  for (const seed of seeds) {
    await db.license.upsert({
      where: { mkAuthAddress: seed.mkAuthAddress },
      update: seed,
      create: seed,
    });
  }

  console.log(`✅ Seed concluído: ${seeds.length} licenças criadas.`);
  console.table(
    seeds.map((s) => ({
      address: s.mkAuthAddress,
      status: s.status,
      expiresAt: s.expiresAt.toISOString().split("T")[0],
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
