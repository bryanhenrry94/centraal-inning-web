import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  // 🔹 Crear planes base
  await prisma.plan.upsert({
    where: { name: "Free" },
    update: {},
    create: {
      name: "Free",
      price: 0,
      description: "Plan gratuito con funciones básicas",
      durationDays: 30,
    },
  });

  await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {},
    create: {
      name: "Pro",
      price: 25,
      description: "Plan profesional con todas las funciones",
      durationDays: 30,
    },
  });

  // 🔹 Crear tenant base (ejemplo)
  await prisma.tenant.upsert({
    where: { id: "0874303e-6795-46ef-8416-5d76bba8071b" },
    update: {},
    create: {
      id: "0874303e-6795-46ef-8416-5d76bba8071b",
      name: "Centraal Inning",
      subdomain: "admin",
      contactEmail: "info@centraalinning.com",
      countryCode: "BQ", // Código de país de Bonaire
      address: "",
      city: "",
      logoUrl: "",
      numberOfEmployees: 0,
      phone: "",
      website: "https://centraalinning.com",
      planId: null,
      planStatus: "active",
      planExpiresAt: null,
      termsAccepted: true,
      isActive: true,
    },
  });

  await prisma.parameter.upsert({
    where: { id: "0874303e-6795-46ef-8416-5d76bba8071b" },
    update: {},
    create: {
      id: "0874303e-6795-46ef-8416-5d76bba8071b",
      porcCobranza: 15,
      porcAbb: 6,
      diasPlazoEmpresaAanmaning: 5,
      diasPlazoConsumidorAanmaning: 15,
      diasPlazoEmpresaSommatie: 0,
      diasPlazoConsumidorSommatie: 0,
      precioEmpresaPequena: 100,
      contribucionEmpresaPequenaPfc: 0,
      precioEmpresaGrande: 0,
      contribucionEmpresaGrandePfc: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      multaAanmaningEmpresa: 0,
      multaAanmaningNatural: 0,
      multaSommatieEmpresa: 0,
      multaSommatieNatural: 0,
      limiteDiasReaccionEmpresa: 0,
      multaNoReaccionEmpresa: 0,
      multaNoReaccionNatural: 0,
      multaAcuerdoPagoEmpresa: 0,
      multaAcuerdoPagoNatural: 0,
      invoiceNumberLength: 8,
      invoicePrefix: "FACTUUR",
      invoiceSecuence: 0,
      bankAccount: "418.825.10",
      bankName: "MCB",
    },
  });

  const passwordHash = await hash("@M1n0T4ur0", 10);

  await prisma.user.upsert({
    where: { id: "28112419-5c53-47c5-b109-a29d02c1bb5d" },
    update: {},
    create: {
      id: "28112419-5c53-47c5-b109-a29d02c1bb5d",
      email: "bryanhenrry94@gmail.com",
      passwordHash: passwordHash,
      fullname: "Bryan Henrry",
      phone: "+59998765432",
      tenantId: "0874303e-6795-46ef-8416-5d76bba8071b",
      role: "SUPERADMIN",
      isActive: true,
    },
  });

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
