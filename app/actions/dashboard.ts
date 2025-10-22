"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const [totalVerdicts, totalDebtors, totalCollection, facturasRecientes] =
      await Promise.all([
        // prisma.cliente.count({ where: { tenantId } }),
        // prisma.producto.count({ where: { tenantId } }),
        // prisma.factura.count({ where: { tenantId } }),
        prisma.verdict.count(),
        prisma.debtor.count(),
        prisma.collectionCase.count(),
        prisma.billingInvoice.findMany({
          // where: { tenantId: process.env.ADMIN_TENANT_ID },
          include: {
            tenant: true,
          },
          // orderBy: { created_at: "desc" },
          take: 5,
        }),
      ]);

    // Calcular ingresos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const facturasDelMes = await prisma.billingInvoice.findMany({
      where: {
        // tenantId: process.env.ADMIN_TENANT_ID,
        createdAt: {
          gte: inicioMes,
        },
      },
      include: {
        tenant: true,
      },
    });

    const incomeMonth = facturasDelMes.reduce(
      (total, factura) => total + factura.amount,
      0
    );

    return {
      success: true,
      data: {
        totalVerdicts,
        totalDebtors,
        totalCollection,
        incomeMonth,
        facturasRecientes,
      },
    };
  } catch (error) {
    console.error("[v0] Error al obtener estadísticas:", error);
    return { success: false, error: "Error al obtener estadísticas" };
  }
}
