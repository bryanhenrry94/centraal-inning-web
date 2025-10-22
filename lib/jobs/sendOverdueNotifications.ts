import {
  getLastNotificationByCollectionCase,
  getNotificationDays,
  sendNotification,
} from "@/app/actions/notification";
import prisma from "@/lib/prisma";

export async function sendOverdueNotifications() {
  const overdueCases = await prisma.collectionCase.findMany({
    where: {
      status: "OVERDUE",
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
    if (!c.reminder1DueDate) continue;
    if (!c.reminder2DueDate) continue;

    // Normalizar las fechas de recordatorio a medianoche
    const reminder1Date = new Date(c.reminder1DueDate);
    reminder1Date.setHours(0, 0, 0, 0);

    // Normalizar las fechas de recordatorio a medianoche
    const reminder2Date = new Date(c.reminder2DueDate);
    reminder2Date.setHours(0, 0, 0, 0);

    // Comparar solo las fechas (sin horas)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      // Si la fecha de recordatorio 1 es hoy y no se ha enviado aún
      reminder1Date.getTime() === today.getTime() &&
      c.reminder1SentAt === null
    ) {
      await sendNotification(c.id);
      sent++;
    }

    if (
      // Si la fecha de recordatorio 2 es hoy y no se ha enviado aún
      reminder2Date.getTime() === today.getTime() &&
      c.reminder2SentAt === null
    ) {
      await sendNotification(c.id);
      sent++;
    }
  }

  return {
    message: "Notificaciones enviadas correctamente",
    sent,
  };
}
