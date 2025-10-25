import prisma from "@/lib/prisma";
import { $Enums } from "@/prisma/generated/prisma";
import { updateCollectionStatusAndSendNotification } from "@/app/actions/collection-case";
import {
  cancelAgreementsByCollectionCase,
  hasAgreement,
  hasPaymentsUpToDate,
} from "@/app/actions/payment-agreement";
import { applyCollectionCaseFine } from "@/app/actions/collection-case-fine";
import { getParameter } from "@/app/actions/parameter";

export async function processCollectionCaseWorkflow() {
  // Obtener todos los casos de cobranza en estados específicos sin notificación de bloqueo
  const collections = await prisma.collectionCase.findMany({
    where: {
      status: {
        in: [
          $Enums.CollectionCaseStatus.AANMANING,
          $Enums.CollectionCaseStatus.SOMMATIE,
          $Enums.CollectionCaseStatus.INGEBREKESTELLING,
        ],
      },
      notifications: {
        none: {
          type: "BLOKKADE",
        },
      },
    },
    include: { debtor: true, notifications: true },
  });

  // Obtener parámetros generales
  const parameter = await getParameter();

  let sent = 0;
  // Procesar cada caso de cobranza
  for (const c of collections) {
    // Comparar solo las fechas (sin horas)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (c.due_date < today) continue;

    // Verificar si tiene acuerdo de pago
    const has_payment_agreement = await hasAgreement(c.id);

    // Si tiene acuerdo de pago, verificar si los pagos están al día
    if (has_payment_agreement) {
      const has_payments_up_to_date = await hasPaymentsUpToDate(c.id);

      // Si no esta al dia registra multa, cancela el acuerdo de pago y avanza al siguiente estado
      if (!has_payments_up_to_date) {
        let penalty_amount = 0;

        if (c.status === $Enums.CollectionCaseStatus.AANMANING) {
          penalty_amount =
            c.debtor.person_type === $Enums.PersonType.COMPANY
              ? Number(parameter?.company_aanmaning_penalty)
              : Number(parameter?.natural_aanmaning_penalty);
        }

        if (c.status === $Enums.CollectionCaseStatus.SOMMATIE) {
          penalty_amount =
            c.debtor.person_type === $Enums.PersonType.COMPANY
              ? Number(parameter?.company_sommatie_penalty)
              : Number(parameter?.natural_sommatie_penalty);
        }

        if (penalty_amount > 0) {
          // Registrar multa
          await applyCollectionCaseFine(
            c.id,
            penalty_amount,
            `Multa por pago atrasado en estado ${c.status}`
          );
        }

        // Cancelar acuerdo de pago aceptados
        await cancelAgreementsByCollectionCase(c.id);
      }
    }

    if (c.status === $Enums.CollectionCaseStatus.AANMANING) {
      await updateCollectionStatusAndSendNotification(
        c.id,
        $Enums.CollectionCaseStatus.SOMMATIE
      );
      sent++;
    }

    if (c.status === $Enums.CollectionCaseStatus.SOMMATIE) {
      await updateCollectionStatusAndSendNotification(
        c.id,
        $Enums.CollectionCaseStatus.INGEBREKESTELLING
      );
      sent++;
    }

    if (c.status === $Enums.CollectionCaseStatus.INGEBREKESTELLING) {
      await updateCollectionStatusAndSendNotification(
        c.id,
        $Enums.CollectionCaseStatus.BLOKKADE
      );
      sent++;
    }
  }

  return {
    message: "Notificaciones enviadas correctamente",
    sent,
  };
}
