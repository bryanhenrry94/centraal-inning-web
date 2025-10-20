"use server";
import prisma from "@/lib/prisma";
import {
  DebtorBase,
  DebtorBaseSchema,
  DebtorCreate,
  IdentificationType,
} from "@/lib/validations/debtor";
import { getUserByEmail } from "@/app/actions/user";
import { roleEnum } from "@/prisma/generated/prisma";
import puppeteer from "puppeteer";
import renderTemplate from "@/common/utils/templateRenderer";
import { getParameterById } from "./parameter";
import FinancialService from "@/common/mail/services/financialService";
import path from "path";

export const getAllDebtorsByTenantId = async (
  tenantId: string
): Promise<DebtorBase[]> => {
  try {
    const debtors = await prisma.debtor.findMany({
      where: {
        tenantId,
      },
    });

    return debtors.map((debtor) => debtor as DebtorBase);
  } catch (error) {
    throw new Error("Error fetching debtors");
  }
};

export const getAllDebtors = async (): Promise<DebtorBase[]> => {
  try {
    const debtors = await prisma.debtor.findMany();

    return debtors.map((debtor) => debtor as DebtorBase);
  } catch (error) {
    throw new Error("Error fetching debtors");
  }
};

export const getDebtorById = async (id: string): Promise<DebtorBase | null> => {
  try {
    const debtor = await prisma.debtor.findFirst({
      where: { id },
      include: {
        incomes: true, // Include incomes if needed
      },
    });

    return debtor as DebtorBase | null;
  } catch (error) {
    throw new Error("Error fetching debtor");
  }
};

export const createDebtor = async (
  debtor: DebtorCreate,
  tenantId: string
): Promise<DebtorBase> => {
  try {
    console.log("Creating debtor:", debtor);
    const newDebtor = await prisma.debtor.create({
      data: {
        identificationType: debtor.identificationType,
        identification: debtor.identification || "",
        fullname: debtor.fullname || "",
        email: debtor.email || "",
        phone: debtor.phone || "",
        address: debtor.address || "",
        personType: debtor.personType || "",
        tenantId,
        totalIncome: debtor.totalIncome || 0,
        incomes: {
          create: debtor.incomes?.map((income) => ({
            debtorId: tenantId,
            source: income.source,
            amount: income.amount,
          })),
        },
      },
    });

    return newDebtor as DebtorBase;
  } catch (error) {
    console.error("Error creating debtor:", error);
    throw new Error("Error creating debtor");
  }
};

export const updateDebtor = async (
  debtor: DebtorCreate,
  tenantId: string,
  id: string
): Promise<DebtorBase | null> => {
  try {
    const updatedDebtor = await prisma.$transaction(async (tx) => {
      // Update debtor
      const debtorResult = await tx.debtor.update({
        where: { id },
        data: {
          identificationType:
            (debtor.identificationType as IdentificationType) ||
            IdentificationType.DNI,
          identification: debtor.identification || "",
          fullname: debtor.fullname || "",
          email: debtor.email || "",
          phone: debtor.phone || "",
          address: debtor.address || "",
          personType: debtor.personType || "",
          tenantId,
        },
      });

      // Handle incomes
      const existingIncomes = await tx.debtorIncome.findMany({
        where: { debtorId: id },
      });

      const incomingIncomes = debtor.incomes ?? [];

      // Delete all incomes for this debtor
      await tx.debtorIncome.deleteMany({
        where: {
          debtorId: id,
        },
      });

      // Re-create all incomes from incomingIncomes
      for (const income of incomingIncomes) {
        await tx.debtorIncome.create({
          data: {
            debtorId: id,
            source: income.source,
            amount: income.amount,
          },
        });
      }

      return debtorResult;
    });

    return updatedDebtor as DebtorBase;
  } catch (error) {
    console.error("Error updating debtor:", error);
    throw new Error("Error updating debtor");
  }
};

export const getDebtorInfo = async (
  tenantId: string,
  identification: string
): Promise<DebtorBase> => {
  const debtor = await prisma.debtor.findFirst({
    where: {
      tenantId: tenantId,
      identification: identification,
    },
    include: {
      user: true, // Assuming there is a relation named 'user' in the Prisma schema
    },
  });

  if (!debtor) {
    throw new Error(
      `Debtor with ID ${identification} not found for tenant ${tenantId}`
    );
  }

  // Validate the debtor data against the schema
  const parsedDebtor = DebtorBaseSchema.parse(debtor);

  // Ensure the return type matches IDebtor
  return parsedDebtor as DebtorBase;
};

export const createDebtorIfNotExists = async (
  tenantId: string,
  debtor: DebtorCreate
): Promise<DebtorCreate> => {
  let userId: string | null = null;

  // Check if the debtor already exists
  const existingDebtor = await getDebtorInfo(
    tenantId,
    debtor.identification ?? ""
  ).catch(() => null);

  if (existingDebtor) {
    throw new Error(
      `Debtor with identification ${debtor.identification} already exists`
    );
  }

  if (await validaEmailDebtorUserExist(debtor.email || "", tenantId, "")) {
    throw new Error(`A user with email ${debtor.email} already exists`);
  }

  const userExist = await getUserByEmail(debtor.email);

  if (!userExist) {
    const newUser = await prisma.user.create({
      data: {
        email: debtor.email,
        fullname: debtor.fullname,
        phone: debtor.phone,
        tenantId: tenantId,
        role: roleEnum.DEBTOR,
        isActive: true,
      },
    });

    userId = newUser.id;
  } else {
    userId = userExist.id;
  }

  // Create the debtor and link it to the user
  const newDebtor = await prisma.debtor.create({
    data: {
      tenantId: tenantId,
      identification: debtor.identification,
      userId: userId, // Assuming the debtor has a userId field to link to the user
      fullname: debtor.fullname,
      email: debtor.email,
      phone: debtor.phone,
      address: debtor.address,
      identificationType: debtor.identificationType as IdentificationType,
      personType: debtor.personType,
    },
  });

  // Validate the debtor data against the schema
  const parsedDebtor = DebtorBaseSchema.parse(newDebtor);

  // Ensure the return type matches IDebtor
  return parsedDebtor as DebtorBase;
};

export const validaEmailDebtorUserExist = async (
  email: string,
  tenantId: string,
  debtorId: string
): Promise<boolean> => {
  if (email) {
    // Busca el usuario por email y tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      // Busca si existe un deudor relacionado con ese usuario en el tenant
      const existingDebtor = await prisma.debtor.findFirst({
        where: {
          tenantId: tenantId,
          userId: existingUser.id,
          NOT: debtorId ? { id: debtorId } : undefined,
        },
      });

      if (existingDebtor) {
        return true;
      }
    }
  }
  return false;
};

export const sendFinancialSummaryEmail = async (
  debtorId: string
): Promise<boolean> => {
  try {
    const debtor = await prisma.debtor.findUnique({
      where: { id: debtorId },
    });

    if (!debtor) return false;

    if (debtor.email) {
      const debtorEmail = debtor.email;
      const subject = `Financieel overzicht - ${new Date().getFullYear()}`;

      const dataMail = {
        recipientName: debtor?.fullname || "Dear User",
        currentYear: new Date().getFullYear(),
      };

      const pdfBuffer = await generateFinancialReportPDF(debtorId);

      if (pdfBuffer) {
        // Guardar el PDF en una ruta temporal
        const tempDir = path.join(process.cwd(), "tmp");
        const fs = await import("fs/promises");
        await fs.mkdir(tempDir, { recursive: true });
        const tempFilePath = path.join(
          tempDir,
          `financieel_overzicht_${debtorId}.pdf`
        );
        await fs.writeFile(tempFilePath, pdfBuffer);

        // Configurar el adjunto usando el archivo temporal
        const attachmentConfig = {
          filename: `financieel_overzicht_${debtorId}.pdf`,
          pdfTemplatePath: tempFilePath,
        };

        if (attachmentConfig.pdfTemplatePath) {
          await FinancialService.sendEmail(
            debtorEmail,
            subject,
            dataMail,
            attachmentConfig
          );
        }
      } else {
        await FinancialService.sendEmail(debtorEmail, subject, dataMail);
      }

      console.log("notificacion de debtor enviada al correo: ", debtorEmail);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const generateFinancialReportPDF = async (
  id: string
): Promise<Buffer> => {
  const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
  const parameter = await getParameterById(PARAMETER_ID);
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  const data = {
    // aqui van los datos del reporte financiero
  };

  const html = renderTemplate("financial/financial-summary", {
    ...data,
    companyName: "Dazzsoft",
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Update this path if Chrome is installed elsewhere
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return Buffer.from(pdfBuffer);
};
