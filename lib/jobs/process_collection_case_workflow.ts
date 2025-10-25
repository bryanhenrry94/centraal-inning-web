import prisma from "@/lib/prisma";
import { sendNotification } from "@/app/actions/notification";
import { $Enums } from "@/prisma/generated/prisma";
import { updateCollectionStatus } from "@/app/actions/collection";
import { hasAgreement } from "@/app/actions/payment-agreement";

export async function processCollectionCaseWorkflow() {
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

  let sent = 0;

  for (const c of collections) {
    if (!c.debtor?.email) continue;

    // Comparar solo las fechas (sin horas)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (c.due_date < today) continue;

    const has_payment_agreement = await hasAgreement(c.id);

    if (has_payment_agreement) {
    }

    if (c.status === $Enums.CollectionCaseStatus.AANMANING) {
      await updateCollectionStatus(c.id, $Enums.CollectionCaseStatus.SOMMATIE);
      await sendNotification(c.id);
      sent++;
    }

    if (c.status === $Enums.CollectionCaseStatus.SOMMATIE) {
      await updateCollectionStatus(
        c.id,
        $Enums.CollectionCaseStatus.INGEBREKESTELLING
      );
      await sendNotification(c.id);
      sent++;
    }
  }

  return {
    message: "Notificaciones enviadas correctamente",
    sent,
  };
}
