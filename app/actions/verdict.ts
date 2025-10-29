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
import { notifyError } from "@/lib/notifications";
import { protocol, rootDomain } from "@/lib/config";
import path from "path";
import fs from "fs/promises";
import { formatCurrency } from "@/utils/formatters";
import { VerdictAttachment } from "@/lib/validations/verdict-attachments";
import { $Enums } from "@/prisma/generated/prisma";

export const getAllVerdicts = async (
  tenant_id: string
): Promise<VerdictResponse[]> => {
  try {
    const verdicts = await prisma.verdict.findMany({
      where: {
        tenant_id,
      },
      include: {
        debtor: true,
        verdict_embargo: true,
        verdict_interest: {
          include: {
            details: true,
          },
        },
      },
    });

    // Map the verdicts to match the VerdictResponse type
    const mappedVerdicts: VerdictResponse[] = verdicts.map((verdict) => ({
      ...verdict,
      procesal_cost:
        verdict.procesal_cost === null ? undefined : verdict.procesal_cost,
      debtor: verdict.debtor
        ? {
            ...verdict.debtor,
            user_id:
              verdict.debtor.user_id === null
                ? undefined
                : verdict.debtor.user_id,
            phone:
              verdict.debtor.phone === null ? undefined : verdict.debtor.phone,
            address:
              verdict.debtor.address === null
                ? undefined
                : verdict.debtor.address,
            person_type:
              verdict.debtor.person_type === null
                ? "INDIVIDUAL"
                : (verdict.debtor.person_type as $Enums.PersonType),
            identification_type:
              verdict.debtor.identification_type === null
                ? "OTHER"
                : (verdict.debtor
                    .identification_type as $Enums.IdentificationType),
            identification:
              verdict.debtor.identification === null
                ? undefined
                : verdict.debtor.identification,
            total_income:
              verdict.debtor.total_income === null
                ? undefined
                : verdict.debtor.total_income,
          }
        : verdict.debtor,
      verdict_interest: verdict.verdict_interest.map((vi) => ({
        interest_type: vi.interest_type,
        base_amount: vi.base_amount,
        calculation_start: vi.calculation_start,
        calculation_end: vi.calculation_end,
        total_interest: vi.total_interest,
        details: vi.details,
        calculated_interest: vi.calculated_interest ?? undefined,
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
        verdict_embargo: true,
        verdict_interest: {
          include: {
            details: true,
          },
        },
        attachments: true,
        bailiff_services: true,
      },
    });

    // Map the verdicts to match the VerdictResponse type
    if (!verdict) return null;
    return {
      ...verdict,
      procesal_cost: verdict.procesal_cost ?? undefined,
      sentence_date: verdict.sentence_date,
      debtor: verdict.debtor
        ? {
            ...verdict.debtor,
            user_id:
              verdict.debtor.user_id === null
                ? undefined
                : verdict.debtor.user_id,
            phone:
              verdict.debtor.phone === null ? undefined : verdict.debtor.phone,
            address:
              verdict.debtor.address === null
                ? undefined
                : verdict.debtor.address,
            person_type:
              verdict.debtor.person_type === null
                ? undefined
                : (verdict.debtor.person_type as "INDIVIDUAL" | "COMPANY"),
            identification_type:
              verdict.debtor.identification_type === null
                ? "OTHER"
                : (verdict.debtor.identification_type as
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
            total_income:
              verdict.debtor.total_income === null
                ? undefined
                : verdict.debtor.total_income,
          }
        : verdict.debtor,
      verdict_interest: verdict.verdict_interest.map((vi) => ({
        interest_type: vi.interest_type,
        base_amount: vi.base_amount,
        calculation_start: vi.calculation_start,
        calculation_end: vi.calculation_end,
        total_interest: vi.total_interest,
        details: vi.details,
        calculated_interest: vi.calculated_interest ?? undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching all Verdicts:", error);
    throw new Error("Error fetching all Verdicts");
  }
};

export const getAttachmentsByVerdictId = async (
  verdict_id: string
): Promise<VerdictAttachment[]> => {
  try {
    const attachments = await prisma.verdictAttachment.findMany({
      where: { verdict_id },
    });
    return attachments;
  } catch (error) {
    console.error("Error fetching attachments by Verdict ID:", error);
    throw new Error("Error fetching attachments by Verdict ID");
  }
};

export const createVerdict = async (
  data: VerdictCreate,
  tenant_id: string
): Promise<VerdictResponse | null> => {
  try {
    console.log("iniciando transaccion verdict");
    // initialize transaction
    const createdVerdict = await prisma.$transaction(async (tx) => {
      // create new verdict
      const newVerdict = await tx.verdict.create({
        data: {
          invoice_number: data.invoice_number,
          creditor_name: data.creditor_name,
          debtor_id: data.debtor_id,
          registration_number: data.registration_number,
          sentence_amount: data.sentence_amount,
          sentence_date: data.sentence_date,
          procesal_cost: data.procesal_cost,
          tenant_id: tenant_id,
        },
      });

      // if verdict interest exists
      if (data.verdict_interest) {
        for (const item of data.verdict_interest) {
          // create verdict interest
          const verdict_interest = await tx.verdictInterest.create({
            data: {
              interest_type: item.interest_type,
              base_amount: item.base_amount,
              calculated_interest: item.calculated_interest,
              calculation_start: item.calculation_start,
              calculation_end: item.calculation_end,
              total_interest: item.total_interest,
              verdict_id: newVerdict.id,
            },
          });

          // create verdict interest details
          await tx.verdictInterestDetails.createMany({
            data: item.details.map((detail) => ({
              ...detail,
              verdict_interest_id: verdict_interest.id,
            })),
          });
        }
      }

      // if verdict embargo exists
      if (data.verdict_embargo) {
        for (const item of data.verdict_embargo) {
          // create verdict embargo
          await tx.verdictEmbargo.create({
            data: {
              verdict_id: newVerdict.id,
              company_name: item.company_name,
              company_phone: item.company_phone,
              company_email: item.company_email,
              company_address: item.company_address,
              embargo_type: item.embargo_type,
              embargo_date: item.embargo_date,
              embargo_amount: item.embargo_amount,
              total_amount: item.total_amount,
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
          invoice_number: data.invoice_number,
          creditor_name: data.creditor_name,
          debtor_id: data.debtor_id,
          registration_number: data.registration_number,
          sentence_amount: data.sentence_amount,
          sentence_date: data.sentence_date,
          procesal_cost: data.procesal_cost,
          bailiff_id: data.bailiff_id ?? null,
        },
      });

      // if verdict interest exists
      if (data.verdict_interest) {
        // elimina los detalles de interest
        // Obtener los IDs de los verdictInterest relacionados a este veredicto
        const verdictInterestIds = (
          await tx.verdictInterest.findMany({
            where: { verdict_id: verdict.id },
            select: { id: true },
          })
        ).map((vi) => vi.id);

        // Eliminar los detalles relacionados a esos verdict_interest
        await tx.verdictInterestDetails.deleteMany({
          where: {
            verdict_interest_id: {
              in: verdictInterestIds,
            },
          },
        });

        // Eliminar los intereses existentes relacionados al veredicto
        await tx.verdictInterest.deleteMany({
          where: { verdict_id: verdict.id },
        });

        for (const item of data.verdict_interest) {
          // create verdict interest
          const verdict_interest = await tx.verdictInterest.create({
            data: {
              interest_type: item.interest_type,
              base_amount: item.base_amount,
              calculated_interest: item.calculated_interest,
              calculation_start: item.calculation_start,
              calculation_end: item.calculation_end,
              total_interest: item.total_interest,
              verdict_id: verdict.id,
            },
          });

          // create verdict interest details
          await tx.verdictInterestDetails.createMany({
            data: item.details.map((detail) => ({
              ...detail,
              verdict_interest_id: verdict_interest.id,
            })),
          });
        }
      }

      // if verdict embargo exists
      if (data.verdict_embargo) {
        // elimina los detalles de embargo
        const verdictEmbargoIds = (
          await tx.verdictEmbargo.findMany({
            where: { verdict_id: verdict.id },
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

        for (const item of data.verdict_embargo) {
          // create verdict embargo
          await tx.verdictEmbargo.create({
            data: {
              verdict_id: verdict.id,
              company_name: item.company_name,
              company_phone: item.company_phone,
              company_email: item.company_email,
              company_address: item.company_address,
              embargo_type: item.embargo_type,
              embargo_date: item.embargo_date,
              embargo_amount: item.embargo_amount,
              total_amount: item.total_amount,
            },
          });
        }
      }

      if (data.bailiff_services) {
        await tx.verdictBailiffServices.deleteMany({
          where: { verdict_id: verdict.id },
        });

        for (const item of data.bailiff_services) {
          await tx.verdictBailiffServices.create({
            data: {
              ...item,
              verdict_id: verdict.id,
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
  interest_type: number,
  base_amount: number,
  calculated_interest: number,
  calculation_start: Date,
  calculation_end: Date
): Promise<VerdictInterestDetailCreate[]> => {
  try {
    const verdictInterestDetails: VerdictInterestDetailCreate[] = [];

    // Validar los parámetros de entrada
    if (
      interest_type === 0 ||
      base_amount === 0 ||
      !calculation_start ||
      !calculation_end
    ) {
      return [];
    }

    // obtener el tipo de interés
    const objInterestType = await getInterestTypeById(interest_type);

    if (!objInterestType) {
      return [];
    }

    // Asegurarse de que calculation_start y calculation_end sean Date
    let fechaInicio =
      calculation_start instanceof Date
        ? calculation_start
        : new Date(calculation_start);
    const fechaFinCalculo =
      calculation_end instanceof Date
        ? calculation_end
        : new Date(calculation_end);

    let montoCalculo = base_amount;

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

      // Interés compuesto: base_amount * (1 + proporcional/100) - base_amount
      const calculated_interest =
        base_amount * Math.pow(1 + proporcional / 100, 1) - base_amount;

      const total = base_amount + calculated_interest;

      const detalle: VerdictInterestDetailCreate = {
        period: `#${tramoIndex}`,
        period_start: fechaInicio,
        period_end: fechaFinTramo,
        days: dias,
        annual_rate: tasaAnual,
        proportional_rate: proporcional,
        base_amount: Math.round(base_amount * 100) / 100,
        interest: Math.round(calculated_interest * 100) / 100,
        total: Math.round(total * 100) / 100,
      };

      verdictInterestDetails.push(detalle);

      // Actualizar base_amount para el siguiente tramo (interés compuesto)
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
          where: { verdict_id: id },
          select: { id: true },
        })
      ).map((vi) => vi.id);

      // Eliminar los detalles relacionados a esos verdict_interest
      await tx.verdictInterestDetails.deleteMany({
        where: {
          verdict_interest_id: {
            in: verdictInterestIds,
          },
        },
      });

      // Eliminar los intereses existentes relacionados al veredicto
      await tx.verdictInterest.deleteMany({
        where: { verdict_id: id },
      });

      const verdictEmbargoIds = (
        await tx.verdictEmbargo.findMany({
          where: { verdict_id: id },
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
      where: { id: createdVerdict.debtor_id },
    });

    if (debtor?.email) {
      const debtorEmail = debtor?.email;
      const subject = `Kennisgeving van vonnis - ${createdVerdict.registration_number}`;

      const dataMail = {
        recipientName: debtor.fullname || "Schuldenaar",
        currentYear: new Date().getFullYear(),
        messageBody:
          "Er is een nieuw vonnis tegen u geregistreerd in het Centraal Incassoplatform (CI). U kunt de details van dit vonnis veilig bekijken door in te loggen op het CI-platform:",
      };

      const dataAttachment = {
        date: new Date().toISOString().split("T")[0],
        debtorName: debtor.fullname,
        reference: createdVerdict.registration_number,
        sentence_date: createdVerdict.sentence_date.toISOString().split("T")[0],
        sentence_amount: formatCurrency(createdVerdict.sentence_amount),
        bankAccountNumber: "114.588.06",
      };

      // // 1, Generar HTML desde plantilla
      // const htmlAttachment = renderTemplate(
      //   "verdict/VerdictDebtor",
      //   dataAttachment
      // );

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
      where: { id: createdVerdict.debtor_id },
    });

    if (debtor?.email) {
      const debtorEmail = debtor?.email;
      const subject = `FACTUUR - ${createdVerdict.invoice_number}`;

      const dataMail = {
        recipientName: createdVerdict.creditor_name || "Schuldenaar",
        currentYear: new Date().getFullYear(),
        messageBody:
          "Er is een nieuw vonnis tegen u geregistreerd in het Centraal Incassoplatform (CI). U kunt de details van dit vonnis veilig bekijken door in te loggen op het CI-platform:",
      };

      const dataAttachment = {
        invoice_number: createdVerdict.invoice_number,
        creditor_name: createdVerdict.creditor_name,
        debtorName: debtor.fullname,
        date: new Date().toISOString().split("T")[0],
        bailiffAmount: formatCurrency(250),
        cioAmount: formatCurrency(150),
        total_amount: formatCurrency(400),
      };

      // // 1, Generar HTML desde plantilla
      // const htmlAttachment = renderTemplate(
      //   "verdict/VerdictCreditor",
      //   dataAttachment
      // );

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
      creditor_name: createdVerdict.creditor_name,
      reference: createdVerdict.registration_number,
      dateVerdict: createdVerdict.sentence_date.toISOString().split("T")[0],
    };

    // // 1, Generar HTML desde plantilla
    // const htmlAttachment = renderTemplate(
    //   "verdict/VerdictApproval",
    //   dataAttachment
    // );

    return false;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const UploadAttachmentToVerdict = async (
  file: File,
  verdict_id: string,
  subdomain: string
) => {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("verdict_id", verdict_id);

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
        verdict_id,
        file_path: data.url,
        file_name: file.name,
        file_size: file.size,
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
      attachment.file_path
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
): Promise<{ success: boolean; file?: string; file_name?: string }> => {
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
      attachment.file_path
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
      file_name: attachment.file_name,
    };
  } catch (error) {
    console.error("Error downloading verdict attachment:", error);
    return { success: false };
  }
};
