"use server";
import prisma from "@/lib/prisma";
import {
  VerdictCreate,
  VerdictResponse,
  VerdictUpdate,
} from "@/lib/validations/verdict";
import { VerdictInterestDetailCreate } from "@/lib/validations/verdict-interest-details";
import { InterestDetail } from "@/lib/validations/interest-type";
import { getInterestTypeById } from "@/app/actions/interest-type";
import VerdictService from "@/common/mail/services/verdictService";
import { notifyError } from "@/lib/notifications";
import { protocol, rootDomain } from "@/lib/utils";
import { generatePDF } from "@/common/utils/pdfGenerator";
import path from "path";
import fs from "fs/promises";
import renderTemplate from "@/common/utils/templateRenderer";
import { formatCurrency } from "@/common/utils/general";
import { VerdictAttachment } from "@/lib/validations/verdict-attachments";

export const getAllVerdicts = async (
  tenantId: string
): Promise<VerdictResponse[]> => {
  try {
    const verdicts = await prisma.verdict.findMany({
      where: {
        tenantId,
      },
      include: {
        debtor: true,
        verdictEmbargo: true,
        verdictInterest: {
          include: {
            details: true,
          },
        },
      },
    });

    // Map the verdicts to match the VerdictResponse type
    const mappedVerdicts: VerdictResponse[] = verdicts.map((verdict) => ({
      ...verdict,
      procesalCost:
        verdict.procesalCost === null ? undefined : verdict.procesalCost,
      debtor: verdict.debtor
        ? {
            ...verdict.debtor,
            userId:
              verdict.debtor.userId === null
                ? undefined
                : verdict.debtor.userId,
            phone:
              verdict.debtor.phone === null ? undefined : verdict.debtor.phone,
            address:
              verdict.debtor.address === null
                ? undefined
                : verdict.debtor.address,
            personType:
              verdict.debtor.personType === null
                ? "individual"
                : (verdict.debtor.personType as "individual" | "company"),
            identificationType:
              verdict.debtor.identificationType === null
                ? "OTHER"
                : (verdict.debtor.identificationType as
                    | "DNI"
                    | "PASSPORT"
                    | "NIE"
                    | "CIF"
                    | "KVK"
                    | "OTHER"),
            identification:
              verdict.debtor.identification === null
                ? undefined
                : verdict.debtor.identification,
            totalIncome:
              verdict.debtor.totalIncome === null
                ? undefined
                : verdict.debtor.totalIncome,
          }
        : verdict.debtor,
      verdictInterest: verdict.verdictInterest.map((vi) => ({
        interestType: vi.interestType,
        baseAmount: vi.baseAmount,
        calculationStart: vi.calculationStart,
        calculationEnd: vi.calculationEnd,
        totalInterest: vi.totalInterest,
        details: vi.details,
        calculatedInterest: vi.calculatedInterest ?? undefined,
      })),
    }));

    return mappedVerdicts;
  } catch (error) {
    console.error("Error fetching all Verdicts:", error);
    throw new Error("Error fetching all Verdicts");
  }
};

export const getVerdictById = async (
  id: string
): Promise<VerdictResponse | null> => {
  try {
    const verdict = await prisma.verdict.findUnique({
      where: { id },
      include: {
        debtor: true,
        verdictEmbargo: true,
        verdictInterest: {
          include: {
            details: true,
          },
        },
        attachments: true,
        bailiffServices: true,
      },
    });

    // Map the verdicts to match the VerdictResponse type
    if (!verdict) return null;
    return {
      ...verdict,
      procesalCost: verdict.procesalCost ?? undefined,
      sentenceDate: verdict.sentenceDate,
      debtor: verdict.debtor
        ? {
            ...verdict.debtor,
            userId:
              verdict.debtor.userId === null
                ? undefined
                : verdict.debtor.userId,
            phone:
              verdict.debtor.phone === null ? undefined : verdict.debtor.phone,
            address:
              verdict.debtor.address === null
                ? undefined
                : verdict.debtor.address,
            personType:
              verdict.debtor.personType === null
                ? undefined
                : (verdict.debtor.personType as "individual" | "company"),
            identificationType:
              verdict.debtor.identificationType === null
                ? "OTHER"
                : (verdict.debtor.identificationType as
                    | "DNI"
                    | "PASSPORT"
                    | "NIE"
                    | "CIF"
                    | "KVK"
                    | "OTHER"),
            identification:
              verdict.debtor.identification === null
                ? undefined
                : verdict.debtor.identification,
            totalIncome:
              verdict.debtor.totalIncome === null
                ? undefined
                : verdict.debtor.totalIncome,
          }
        : verdict.debtor,
      verdictInterest: verdict.verdictInterest.map((vi) => ({
        interestType: vi.interestType,
        baseAmount: vi.baseAmount,
        calculationStart: vi.calculationStart,
        calculationEnd: vi.calculationEnd,
        totalInterest: vi.totalInterest,
        details: vi.details,
        calculatedInterest: vi.calculatedInterest ?? undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching all Verdicts:", error);
    throw new Error("Error fetching all Verdicts");
  }
};

export const getAttachmentsByVerdictId = async (
  verdictId: string
): Promise<VerdictAttachment[]> => {
  try {
    const attachments = await prisma.verdictAttachment.findMany({
      where: { verdictId },
    });
    return attachments;
  } catch (error) {
    console.error("Error fetching attachments by Verdict ID:", error);
    throw new Error("Error fetching attachments by Verdict ID");
  }
};

export const createVerdict = async (
  data: VerdictCreate,
  tenantId: string
): Promise<VerdictResponse | null> => {
  try {
    console.log("iniciando transaccion verdict");
    // initialize transaction
    const createdVerdict = await prisma.$transaction(async (tx) => {
      // create new verdict
      const newVerdict = await tx.verdict.create({
        data: {
          invoiceNumber: data.invoiceNumber,
          creditorName: data.creditorName,
          debtorId: data.debtorId,
          registrationNumber: data.registrationNumber,
          sentenceAmount: data.sentenceAmount,
          sentenceDate: data.sentenceDate,
          procesalCost: data.procesalCost,
          tenantId: tenantId,
        },
      });

      // if verdict interest exists
      if (data.verdictInterest) {
        for (const item of data.verdictInterest) {
          // create verdict interest
          const verdictInterest = await tx.verdictInterest.create({
            data: {
              interestType: item.interestType,
              baseAmount: item.baseAmount,
              calculatedInterest: item.calculatedInterest,
              calculationStart: item.calculationStart,
              calculationEnd: item.calculationEnd,
              totalInterest: item.totalInterest,
              verdictId: newVerdict.id,
            },
          });

          // create verdict interest details
          await tx.verdictInterestDetails.createMany({
            data: item.details.map((detail) => ({
              ...detail,
              verdictInterestId: verdictInterest.id,
            })),
          });
        }
      }

      // if verdict embargo exists
      if (data.verdictEmbargo) {
        for (const item of data.verdictEmbargo) {
          // create verdict embargo
          await tx.verdictEmbargo.create({
            data: {
              verdictId: newVerdict.id,
              companyName: item.companyName,
              companyPhone: item.companyPhone,
              companyEmail: item.companyEmail,
              companyAddress: item.companyAddress,
              embargoType: item.embargoType,
              embargoDate: item.embargoDate,
              embargoAmount: item.embargoAmount,
              totalAmount: item.totalAmount,
            },
          });
        }
      }

      return newVerdict;
    });

    if (createdVerdict) {
      return getVerdictById(createdVerdict.id);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error saving Verdict:", error);
    throw new Error("Error saving Verdict");
  }
};

export const updateVerdict = async (
  id: string,
  data: VerdictUpdate
): Promise<VerdictResponse | null> => {
  try {
    const updatedVerdict = await prisma.$transaction(async (tx) => {
      const verdict = await prisma.verdict.update({
        where: { id },
        data: {
          invoiceNumber: data.invoiceNumber,
          creditorName: data.creditorName,
          debtorId: data.debtorId,
          registrationNumber: data.registrationNumber,
          sentenceAmount: data.sentenceAmount,
          sentenceDate: data.sentenceDate,
          procesalCost: data.procesalCost,
          bailiffId: data.bailiffId ?? null,
        },
      });

      // if verdict interest exists
      if (data.verdictInterest) {
        // elimina los detalles de interest
        // Obtener los IDs de los verdictInterest relacionados a este veredicto
        const verdictInterestIds = (
          await tx.verdictInterest.findMany({
            where: { verdictId: verdict.id },
            select: { id: true },
          })
        ).map((vi) => vi.id);

        // Eliminar los detalles relacionados a esos verdictInterest
        await tx.verdictInterestDetails.deleteMany({
          where: {
            verdictInterestId: {
              in: verdictInterestIds,
            },
          },
        });

        // Eliminar los intereses existentes relacionados al veredicto
        await tx.verdictInterest.deleteMany({
          where: { verdictId: verdict.id },
        });

        for (const item of data.verdictInterest) {
          // create verdict interest
          const verdictInterest = await tx.verdictInterest.create({
            data: {
              interestType: item.interestType,
              baseAmount: item.baseAmount,
              calculatedInterest: item.calculatedInterest,
              calculationStart: item.calculationStart,
              calculationEnd: item.calculationEnd,
              totalInterest: item.totalInterest,
              verdictId: verdict.id,
            },
          });

          // create verdict interest details
          await tx.verdictInterestDetails.createMany({
            data: item.details.map((detail) => ({
              ...detail,
              verdictInterestId: verdictInterest.id,
            })),
          });
        }
      }

      // if verdict embargo exists
      if (data.verdictEmbargo) {
        // elimina los detalles de embargo
        const verdictEmbargoIds = (
          await tx.verdictEmbargo.findMany({
            where: { verdictId: verdict.id },
            select: { id: true },
          })
        ).map((vi) => vi.id);

        await tx.verdictEmbargo.deleteMany({
          where: {
            id: {
              in: verdictEmbargoIds,
            },
          },
        });

        for (const item of data.verdictEmbargo) {
          // create verdict embargo
          await tx.verdictEmbargo.create({
            data: {
              verdictId: verdict.id,
              companyName: item.companyName,
              companyPhone: item.companyPhone,
              companyEmail: item.companyEmail,
              companyAddress: item.companyAddress,
              embargoType: item.embargoType,
              embargoDate: item.embargoDate,
              embargoAmount: item.embargoAmount,
              totalAmount: item.totalAmount,
            },
          });
        }
      }

      if (data.bailiffServices) {
        await tx.verdictBailiffServices.deleteMany({
          where: { verdictId: verdict.id },
        });

        for (const item of data.bailiffServices) {
          await tx.verdictBailiffServices.create({
            data: {
              ...item,
              verdictId: verdict.id,
            },
          });
        }
      }

      return verdict;
    });

    return await getVerdictById(updatedVerdict.id);
  } catch (error) {
    console.error("Error updating Verdict:", error);
    throw new Error("Error updating Verdict");
  }
};

export const calculateInterestDetail = async (
  interestType: number,
  baseAmount: number,
  calculatedInterest: number,
  calculationStart: Date,
  calculationEnd: Date
): Promise<VerdictInterestDetailCreate[]> => {
  try {
    const verdictInterestDetails: VerdictInterestDetailCreate[] = [];

    // Validar los parámetros de entrada
    if (
      interestType === 0 ||
      baseAmount === 0 ||
      !calculationStart ||
      !calculationEnd
    ) {
      return [];
    }

    // obtener el tipo de interés
    const objInterestType = await getInterestTypeById(interestType);

    if (!objInterestType) {
      return [];
    }

    // Asegurarse de que calculationStart y calculationEnd sean Date
    let fechaInicio =
      calculationStart instanceof Date
        ? calculationStart
        : new Date(calculationStart);
    const fechaFinCalculo =
      calculationEnd instanceof Date
        ? calculationEnd
        : new Date(calculationEnd);

    let montoCalculo = baseAmount;

    // Ordenar los details por fecha ascendente
    const details: InterestDetail[] = (objInterestType.details || [])
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let tramoIndex = 1;

    while (fechaInicio < fechaFinCalculo && montoCalculo > 0) {
      // Buscar el detalle aplicable para la fecha actual
      const objInteresDetalle = details.find(
        (det) => new Date(det.date) > fechaInicio
      );
      let tasaAnual = 0;
      let fechaFinTramo: Date;

      if (!objInteresDetalle) {
        // Si no hay un detalle futuro, usar la tasa del último detalle anterior a la fecha fin ingresada
        const prevDetalles = details.filter(
          (det) => new Date(det.date) <= fechaInicio
        );
        const lastPrevDetalle =
          prevDetalles.length > 0
            ? prevDetalles[prevDetalles.length - 1]
            : details[details.length - 1];
        tasaAnual = lastPrevDetalle?.rate ?? 0;
        fechaFinTramo = new Date(fechaFinCalculo);
      } else {
        // Buscar el último detalle menor o igual a la fecha actual
        const prevDetalles = details.filter(
          (det) => new Date(det.date) <= new Date(fechaInicio)
        );
        const lastPrevDetalle =
          prevDetalles.length > 0
            ? prevDetalles[prevDetalles.length - 1]
            : details[0];
        tasaAnual = lastPrevDetalle?.rate ?? 0;
        fechaFinTramo = new Date(objInteresDetalle.date);
        // El tramo no puede pasar de la fecha fin de cálculo
        if (fechaFinTramo > fechaFinCalculo) {
          fechaFinTramo = new Date(fechaFinCalculo);
        }
      }

      // Calcular días del tramo
      const dias: number = Math.ceil(
        (fechaFinTramo.getTime() - fechaInicio.getTime()) / (1000 * 3600 * 24)
      );

      const proporcional = (tasaAnual / 365) * dias;

      // Interés compuesto: baseAmount * (1 + proporcional/100) - baseAmount
      const calculatedInterest =
        baseAmount * Math.pow(1 + proporcional / 100, 1) - baseAmount;

      const total = baseAmount + calculatedInterest;

      const detalle: VerdictInterestDetailCreate = {
        period: `#${tramoIndex}`,
        periodStart: fechaInicio,
        periodEnd: fechaFinTramo,
        days: dias,
        annualRate: tasaAnual,
        proportionalRate: proporcional,
        baseAmount: Math.round(baseAmount * 100) / 100,
        interest: Math.round(calculatedInterest * 100) / 100,
        total: Math.round(total * 100) / 100,
      };

      verdictInterestDetails.push(detalle);

      // Actualizar baseAmount para el siguiente tramo (interés compuesto)
      montoCalculo = total;
      fechaInicio = fechaFinTramo;
      tramoIndex++;
    }

    return verdictInterestDetails;
  } catch (error) {
    return [];
  }
};

export const deleteVerdict = async (id: string): Promise<boolean> => {
  try {
    return await prisma.$transaction(async (tx) => {
      const verdictInterestIds = (
        await tx.verdictInterest.findMany({
          where: { verdictId: id },
          select: { id: true },
        })
      ).map((vi) => vi.id);

      // Eliminar los detalles relacionados a esos verdictInterest
      await tx.verdictInterestDetails.deleteMany({
        where: {
          verdictInterestId: {
            in: verdictInterestIds,
          },
        },
      });

      // Eliminar los intereses existentes relacionados al veredicto
      await tx.verdictInterest.deleteMany({
        where: { verdictId: id },
      });

      const verdictEmbargoIds = (
        await tx.verdictEmbargo.findMany({
          where: { verdictId: id },
          select: { id: true },
        })
      ).map((vi) => vi.id);

      await tx.verdictEmbargo.deleteMany({
        where: {
          id: {
            in: verdictEmbargoIds,
          },
        },
      });

      await tx.verdict.delete({
        where: { id },
      });

      return true;
    });
  } catch (error) {
    console.error("Error deleting Verdict:", error);
    throw new Error("Error deleting Verdict");
  }
};

export const handleSendMailNotificationDebtor = async (
  id: string
): Promise<boolean> => {
  try {
    const createdVerdict = await prisma.verdict.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!createdVerdict) return false;

    const debtor = await prisma.debtor.findUnique({
      where: { id: createdVerdict.debtorId },
    });

    if (debtor?.email) {
      const debtorEmail = debtor?.email;
      const subject = `Kennisgeving van vonnis - ${createdVerdict.registrationNumber}`;

      const dataMail = {
        recipientName: debtor.fullname || "Schuldenaar",
        currentYear: new Date().getFullYear(),
        messageBody:
          "Er is een nieuw vonnis tegen u geregistreerd in het Centraal Incassoplatform (CI). U kunt de details van dit vonnis veilig bekijken door in te loggen op het CI-platform:",
      };

      const dataAttachment = {
        date: new Date().toISOString().split("T")[0],
        debtorName: debtor.fullname,
        reference: createdVerdict.registrationNumber,
        sentenceDate: createdVerdict.sentenceDate.toISOString().split("T")[0],
        sentenceAmount: formatCurrency(createdVerdict.sentenceAmount),
        bankAccountNumber: "114.588.06",
      };

      // 1, Generar HTML desde plantilla
      const htmlAttachment = renderTemplate(
        "verdict/VerdictDebtor",
        dataAttachment
      );

      const result = await GenerateReportApprovalFromHTML(
        createdVerdict.tenant.subdomain,
        htmlAttachment
      );

      if (result.success && result.filePath) {
        const absolutePath = path.join(
          process.cwd(),
          "public",
          result.filePath
        );

        const attachmentConfig = {
          filename: `vonnis_${createdVerdict.id}.pdf`,
          pdfTemplatePath: absolutePath,
        };

        if (attachmentConfig.pdfTemplatePath) {
          await VerdictService.sendEmail(
            debtorEmail,
            subject,
            dataMail,
            attachmentConfig
          );
        }
      } else {
        await VerdictService.sendEmail(debtorEmail, subject, dataMail);
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

export const handleSendMailNotificationCreditor = async (
  id: string
): Promise<boolean> => {
  try {
    const createdVerdict = await prisma.verdict.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!createdVerdict) return false;

    const debtor = await prisma.debtor.findUnique({
      where: { id: createdVerdict.debtorId },
    });

    if (debtor?.email) {
      const debtorEmail = debtor?.email;
      const subject = `FACTUUR - ${createdVerdict.invoiceNumber}`;

      const dataMail = {
        recipientName: createdVerdict.creditorName || "Schuldenaar",
        currentYear: new Date().getFullYear(),
        messageBody:
          "Er is een nieuw vonnis tegen u geregistreerd in het Centraal Incassoplatform (CI). U kunt de details van dit vonnis veilig bekijken door in te loggen op het CI-platform:",
      };

      const dataAttachment = {
        invoiceNumber: createdVerdict.invoiceNumber,
        creditorName: createdVerdict.creditorName,
        debtorName: debtor.fullname,
        date: new Date().toISOString().split("T")[0],
        bailiffAmount: formatCurrency(250),
        cioAmount: formatCurrency(150),
        totalAmount: formatCurrency(400),
      };

      // 1, Generar HTML desde plantilla
      const htmlAttachment = renderTemplate(
        "verdict/VerdictCreditor",
        dataAttachment
      );

      const result = await GenerateReportApprovalFromHTML(
        createdVerdict.tenant.subdomain,
        htmlAttachment
      );

      if (result.success && result.filePath) {
        const absolutePath = path.join(
          process.cwd(),
          "public",
          result.filePath
        );

        const attachmentConfig = {
          filename: `vonnis_${createdVerdict.id}.pdf`,
          pdfTemplatePath: absolutePath,
        };

        if (attachmentConfig.pdfTemplatePath) {
          await VerdictService.sendEmail(
            debtorEmail,
            subject,
            dataMail,
            attachmentConfig
          );
        }
      } else {
        await VerdictService.sendEmail(debtorEmail, subject, dataMail);
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

export const handleSendMailNotificationBailiff = async (
  id: string
): Promise<boolean> => {
  try {
    const createdVerdict = await prisma.verdict.findUnique({
      where: { id },
      include: { tenant: true, bailiff: true },
    });

    if (!createdVerdict) return false;
    if (!createdVerdict.id) return false;

    if (!createdVerdict.bailiff?.email) {
      console.log("No bailiff email found for verdict id:", createdVerdict.id);
      return false;
    }

    const dataAttachment = {
      date: new Date().toISOString().split("T")[0],
      bailiffName: createdVerdict.bailiff.fullname,
      creditorName: createdVerdict.creditorName,
      reference: createdVerdict.registrationNumber,
      dateVerdict: createdVerdict.sentenceDate.toISOString().split("T")[0],
    };

    // 1, Generar HTML desde plantilla
    const htmlAttachment = renderTemplate(
      "verdict/VerdictApproval",
      dataAttachment
    );

    const result = await GenerateReportApprovalFromHTML(
      createdVerdict.tenant.subdomain,
      htmlAttachment
    );

    const bailiffMail = createdVerdict.bailiff?.email;
    const subject = "Nieuwe vonnis voor u beschikbaar";

    const dataMail = {
      recipientName: createdVerdict.bailiff?.fullname || "Deurwaarder",
      currentYear: new Date().getFullYear(),
      messageBody:
        "Er is een nieuw vonnis voor u beschikbaar. Log in op het CI-platform om de details te bekijken:",
    };

    if (result.success && result.filePath) {
      const absolutePath = path.join(process.cwd(), "public", result.filePath);
      console.log("Generated PDF path:", absolutePath);

      const attachmentConfig = {
        filename: `vonnis_${createdVerdict.id}.pdf`,
        pdfTemplatePath: absolutePath,
      };

      if (attachmentConfig.pdfTemplatePath) {
        await VerdictService.sendEmail(
          bailiffMail,
          subject,
          dataMail,
          attachmentConfig
        );
      }
    }

    return false;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const UploadAttachmentToVerdict = async (
  file: File,
  verdictId: string,
  subdomain: string
) => {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("verdictId", verdictId);

    const URL = `${protocol}://${rootDomain}/api/verdicts/upload`;

    // Sube el archivo a /public/verdicts con el nombre del veredicto
    // Si estamos en desarrollo, ignorar certificados SSL inválidos
    const fetchOptions: RequestInit = {
      method: "POST",
      body: fd,
      headers: {
        "x-tenant": subdomain, // TODO: cambiar esto cuando haya multi-tenant
      },
    };

    console.log("Uploading file to:", URL);

    const res = await fetch(URL, fetchOptions);

    const data = await res.json();

    console.log("File upload response:", data);

    if (!res.ok) throw new Error(data?.error || "Error al subir");

    if (!data.tenant) {
      // Si no hay datos del inquilino, no se puede actualizar
      notifyError("No se encontraron datos del inquilino");
      return;
    }

    // Actualiza la ruta del archivo en la base de datos
    await prisma.verdictAttachment.create({
      data: {
        verdictId,
        filePath: data.url,
        fileName: file.name,
        fileSize: file.size,
      },
    });

    return res.ok;
  } catch (error) {
    console.error("Error uploading file:", error);
    return false;
  }
};

export const approveVerdict = async (id: string): Promise<boolean> => {
  try {
    const response = await prisma.verdict.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    return response ? true : false;
  } catch (error) {
    return false;
  }
};

export const requestVerdictApproval = async (id: string): Promise<boolean> => {
  try {
    const response = await prisma.verdict.update({
      where: { id },
      data: { status: "PENDING" },
    });

    return response ? true : false;
  } catch (error) {
    return false;
  }
};

export const GenerateReportApprovalFromHTML = async (
  slug: string,
  html: string
): Promise<{ success: boolean; filePath?: string }> => {
  const filename = "bailiff_report.pdf";

  // Definir paths de forma clara
  const publicPath = path.join("uploads", slug, "verdict");
  const absolutePath = path.resolve(process.cwd(), "public", publicPath);
  const pdfPath = path.join(absolutePath, filename);
  const filePath = path.join("/", publicPath, filename); // para guardar en DB (URL relativa)

  try {
    // Crear carpeta y generar PDF en paralelo
    await fs.mkdir(absolutePath, { recursive: true });
    await generatePDF(html, pdfPath);

    return {
      success: true,
      filePath: filePath,
    };
  } catch (error) {
    console.error("❌ Error al generar reporte:", error);
    return { success: false };
  }
};

export const DeleteVerdictAttachment = async (id: string): Promise<boolean> => {
  try {
    // Buscar el attachment en la base de datos
    const attachment = await prisma.verdictAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      console.error("Attachment not found with id:", id);
      return false;
    }

    // Construir la ruta absoluta del archivo
    const absoluteFilePath = path.join(
      process.cwd(),
      "public",
      attachment.filePath
    );

    // Eliminar el archivo del sistema de archivos
    try {
      await fs.unlink(absoluteFilePath);
      console.log("Archivo eliminado:", absoluteFilePath);
    } catch (fsError) {
      console.error("Error deleting file from filesystem:", fsError);
      // Continuar incluso si hay un error al eliminar el archivo
    }

    // Eliminar el registro del attachment en la base de datos
    await prisma.verdictAttachment.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting verdict attachment:", error);
    return false;
  }
};

export const DownloadVerdictAttachment = async (
  id: string
): Promise<{ success: boolean; file?: string; fileName?: string }> => {
  try {
    // Buscar el attachment en la base de datos
    const attachment = await prisma.verdictAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      console.error("Attachment not found with id:", id);
      return { success: false };
    }

    // Construir la ruta absoluta del archivo
    const absoluteFilePath = path.join(
      process.cwd(),
      "public",
      attachment.filePath
    );

    console.log("Attempting to read file at:", absoluteFilePath);

    // Verificar si el archivo existe y leerlo
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(absoluteFilePath);
    } catch (fsError) {
      console.error("File does not exist on filesystem:", fsError);
      return { success: false };
    }

    // Convert Buffer to base64 string for safe transfer to client
    const fileBase64 = fileBuffer.toString("base64");

    return {
      success: true,
      file: fileBase64,
      fileName: attachment.fileName,
    };
  } catch (error) {
    console.error("Error downloading verdict attachment:", error);
    return { success: false };
  }
};
