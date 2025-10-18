"use server";

import {
  ICreateDebtorContribution,
  IDebtorContribution,
  IDebtorContributionStatusQuery,
  IPartialCompanyContribution,
  IUpdateDebtorContributionStatus,
} from "@/lib/validations/debtor-contribution";

export const createContribution = async (
  tenantId: string,
  data: ICreateDebtorContribution
): Promise<IDebtorContribution> => {
  // // Valudamos que el tenantId sea correcto
  // const tenantInfo = await validateTenantById(tenantId);
  // // Valudamos que el debtorId sea correcto
  // const debtorInfo = await getDebtorById(data.debtorId);
  // if (!debtorInfo) {
  //   throw new Error("Debtor not found");
  // }
  // const contribution = await prisma.debtorContribution.create({
  //   data: {
  //     ...data,
  //     companyId: tenantInfo.id,
  //     verificationStatus: "pending",
  //   },
  // });
  // // Aqui debemos enviar un correo a todas las empresas para que contribuyan a identificar al deudor
  // await sendContributionCompanies(debtorInfo.fullname, contribution.id);
  // return DebtorContributionSchema.parse(contribution);
  throw new Error("Not implemented");
};

export const addCompanyInfoToContribution = async (
  contributionId: string,
  payload: IPartialCompanyContribution
): Promise<IDebtorContribution> => {
  // const updated = await prisma.debtorContribution.update({
  //   where: { id: contributionId },
  //   data: {
  //     companyName: payload.companyName,
  //     companyContact: payload.companyContact,
  //     companyEmail: payload.companyEmail,
  //     companyPhone: payload.companyPhone,
  //     extraInfo: payload.extraInfo,
  //     verificationStatus: "contributed",
  //   },
  // });

  // return DebtorContributionSchema.parse(updated);

  throw new Error("Not implemented");
};

// Leer todas las contribuciones (admin)
export const getAllContributions = async (
  payload: IDebtorContributionStatusQuery
): Promise<IDebtorContribution[]> => {
  // const contributions = await prisma.debtorContribution.findMany({
  //   where: {
  //     verificationStatus: payload.status,
  //   },
  //   include: {
  //     debtor: true,
  //     createdByUser: true,
  //   },
  // });

  // return contributions.map((contribution) =>
  //   DebtorContributionSchema.parse(contribution)
  // );
  throw new Error("Not implemented");
};

// Leer contribuciones hechas por la empresa y pendientes de validación
export const getContributionsByCompanyAndStatus = async (
  tenantId: string,
  payload: IDebtorContributionStatusQuery
): Promise<IDebtorContribution[]> => {
  // // Validamos que el tenantId sea correcto
  // const tenantInfo = await validateTenantById(tenantId);

  // const contributions = await prisma.debtorContribution.findMany({
  //   where: {
  //     companyId: tenantInfo.id,
  //     verificationStatus: payload.status,
  //   },
  //   include: {
  //     debtor: true,
  //     createdByUser: true,
  //   },
  // });

  // return contributions.map((contribution) =>
  //   DebtorContributionSchema.parse(contribution)
  // );
  throw new Error("Not implemented");
};

// Validar o rechazar una contribución
export const updateContributionStatus = async (
  contributionId: string,
  payload: IUpdateDebtorContributionStatus
): Promise<IDebtorContribution> => {
  // const updated = await prisma.debtorContribution.update({
  //   where: { id: contributionId },
  //   data: {
  //     verificationStatus: payload.status,
  //     notes: payload.notes,
  //   },
  // });
  // return DebtorContributionSchema.parse(updated);
  throw new Error("Not implemented");
};

// Leer contribuciones por deudor
export const getContributionsByDebtor = async (
  debtorId: string
): Promise<IDebtorContribution[]> => {
  // const contributions = await prisma.debtorContribution.findMany({
  //   where: { debtorId },
  //   include: {
  //     createdByUser: true,
  //   },
  // });
  // return contributions.map((contribution) =>
  //   DebtorContributionSchema.parse(contribution)
  // );
  throw new Error("Not implemented");
};

export const sendContributionCompanies = async (
  debtorName: string,
  contributionId: string
) => {
  // // Aquí debes obtener el tenantId de alguna manera, por ejemplo, pasándolo como argumento
  // const companies = await getAllTenants();

  // console.log(`companies`, companies);
  // for (const tenantInfo of companies) {
  //   const verificationLink = `${protocol}://${tenantInfo.subdomain}.${rootDomain}/collective-contributions?id=${contributionId}`;

  //   // console.log(`verificationLink`, verificationLink);
  //   // console.log(`tenantInfo`, tenantInfo);
  //   // console.log(`tenantInfo.clientEmail`, tenantInfo.contactEmail);
  //   // console.log(`tenantInfo.name`, tenantInfo.name);

  //   DebtorServiceMail.sendContribution(
  //     tenantInfo.contactEmail,
  //     tenantInfo.name,
  //     debtorName,
  //     verificationLink
  //   )
  //     .then(() => {
  //       console.log(`Email sent successfully to ${tenantInfo.contactEmail}`);
  //     })
  //     .catch((error) => {
  //       console.error(
  //         `Error sending email to ${tenantInfo.contactEmail}:`,
  //         error
  //       );
  //     });
  // }
  throw new Error("Not implemented");
};
