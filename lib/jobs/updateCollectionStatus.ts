import prisma from "@/lib/prisma";

export async function updateCollectionStatus() {
  const today = new Date();

  // Buscar cobranzas que estén vencidas y sin pago
  const overdueCollections = await prisma.collectionCase.findMany({
    where: {
      status: { in: ["PENDING"] },
      due_date: { lt: today },
      payments: { none: {} }, // sin pagos registrados
      agreements: { none: { status: "ACCEPTED" } }, // sin acuerdos aceptados (incluye ninguno)
    },
    include: {
      debtor: true,
      notifications: true,
    },
  });

  // Actualizar a OVERDUE
  const updated = await prisma.collectionCase.updateMany({
    where: {
      id: { in: overdueCollections.map((c) => c.id) },
    },
    data: {
      status: "IN_PROGRESS",
    },
  });

  // Retornar las IDs afectadas para el siguiente job (notificaciones)
  return {
    message: "Estados actualizados correctamente",
    count: updated.count,
    overdueCollections,
  };
}
