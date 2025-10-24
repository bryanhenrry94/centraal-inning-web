import prisma from "@/lib/prisma";
import { sendNotification } from "@/app/actions/notification";
import { $Enums } from "@/prisma/generated/prisma";

export async function processCollectionCaseWorkflow() {
  const overdueCases = await prisma.collectionCase.findMany({
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

  for (const c of overdueCases) {
    if (!c.debtor?.email) continue;

    // Comparar solo las fechas (sin horas)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await sendNotification(c.id);
    sent++;
  }

  return {
    message: "Notificaciones enviadas correctamente",
    sent,
  };
}
