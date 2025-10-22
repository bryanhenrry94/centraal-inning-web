import prisma from "@/lib/prisma";

export async function checkPaymentAgreements() {
  const today = new Date();

  // Buscar todos los acuerdos de pago con estado "ON_TIME" o "OVERDUE"
  const agreements = await prisma.paymentAgreement.findMany({
    where: {
      status: { in: ["ACTIVE", "OVERDUE"] },
    },
    include: {
      installments: true,
    },
  });

  let updatedCount = 0;

  for (const agreement of agreements) {
    const installments = agreement.installments;

    if (installments.length === 0) continue;

    const hasOverdue = installments.some(
      (inst) => inst.dueDate < today && inst.status !== "PAID"
    );

    const allPaid = installments.every((inst) => inst.status === "PAID");

    let newStatus: "ACTIVE" | "OVERDUE" | "PAID" = "ACTIVE";

    if (allPaid) {
      newStatus = "PAID";
    } else if (hasOverdue) {
      newStatus = "OVERDUE";
    }

    // Solo actualiza si hay un cambio real
    if (agreement.status !== newStatus) {
      await prisma.paymentAgreement.update({
        where: { id: agreement.id },
        data: { status: newStatus },
      });
      updatedCount++;
    }
  }

  return {
    message: "Estados de acuerdos de pago verificados correctamente",
    updated: updatedCount,
  };
}
