import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  // 🔹 Crear tenant base (ejemplo)
  await prisma.tenant.upsert({
    where: { id: "0874303e-6795-46ef-8416-5d76bba8071b" },
    update: {},
    create: {
      id: "0874303e-6795-46ef-8416-5d76bba8071b",
      code: "CENTRAAL", // Código único para el tenant
      name: "Centraal Inning",
      legal_name: "Centraal Inning N.V.",
      kvk: "12345678",
      subdomain: "admin",
      contact_email: "info@centraalinning.com",
      country_code: "BQ", // Código de país de Bonaire
      address: "",
      city: "",
      logo_url: "",
      number_of_employees: 0,
      phone: "",
      website: "https://centraalinning.com",
      terms_accepted: true,
      is_active: true,
    },
  });

  await prisma.parameter.upsert({
    where: { id: "0874303e-6795-46ef-8416-5d76bba8071b" },
    update: {},
    create: {
      id: "0874303e-6795-46ef-8416-5d76bba8071b",
      collection_fee_rate: 15,
      abb_rate: 6,
      company_aanmaning_term_days: 5,
      consumer_aanmaning_term_days: 14,
      company_sommatie_term_days: 7,
      consumer_sommatie_term_days: 16,
      small_company_price: 100,
      small_company_pfc_contribution: 0,
      large_company_price: 200,
      large_company_pfc_contribution: 0,
      company_aanmaning_penalty: 0,
      natural_aanmaning_penalty: 0,
      company_sommatie_penalty: 0,
      natural_sommatie_penalty: 0,
      company_reaction_limit_days: 0,
      company_no_reaction_penalty: 0,
      natural_no_reaction_penalty: 0,
      company_payment_agreement_fee: 0,
      natural_payment_agreement_fee: 0,
      invoice_number_length: 8,
      invoice_prefix: "FACTUUR",
      invoice_sequence: 0,
      bank_account: "418.825.10",
      bank_name: "MCB",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const password_hash = await hash("@M1n0T4ur0", 10);

  await prisma.user.upsert({
    where: { id: "28112419-5c53-47c5-b109-a29d02c1bb5d" },
    update: {},
    create: {
      id: "28112419-5c53-47c5-b109-a29d02c1bb5d",
      email: "bryanhenrry94@gmail.com",
      password_hash: password_hash,
      fullname: "Bryan Henrry",
      phone: "+59998765432",
      tenant_id: "0874303e-6795-46ef-8416-5d76bba8071b",
      role: "PLATFORM_OWNER",
      is_active: true,
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
