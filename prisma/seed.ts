import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PLAN_FEATURES } from "../src/lib/feature-flags/features";

const prisma = new PrismaClient();

async function main() {
  const plan = await prisma.plan.upsert({
    where: { key: "core" },
    update: {},
    create: {
      key: "core",
      name: "Core",
      description: "Plano de entrada com os módulos essenciais para PMEs",
      priceMonthly: 79.9,
      stripePriceId: process.env.STRIPE_PRICE_ID_CORE || null,
      features: DEFAULT_PLAN_FEATURES.core,
    },
  });

  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@zetris.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@zetris.com",
      passwordHash,
      isPlatformAdmin: true,
    },
  });

  const company = await prisma.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: {
      id: "seed-company",
      name: "Empresa Demo",
      ownerId: user.id,
      settings: { create: {} },
    },
  });

  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: user.id } },
    update: {},
    create: { companyId: company.id, userId: user.id, role: "OWNER" },
  });

  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planId: plan.id,
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed concluído. Login: admin@zetris.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
