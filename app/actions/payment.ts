"use server";
import prisma from "@/lib/prisma";
import { Payment, PaymentCreate } from "@/lib/validations/payment";

export const registerPayment = async (payload: PaymentCreate) => {
  // Create payment
  await prisma.collectionCasePayment.create({
    data: {
      ...payload,
      payment_date: new Date(payload.payment_date),
      created_at: new Date(),
    },
  });

  if (payload.collection_case_id) {
    // Update collection case balance
    const payments = await prisma.collectionCasePayment.findMany({
      where: { collection_case_id: payload.collection_case_id },
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const collectionCase = await prisma.collectionCase.findUnique({
      where: { id: payload.collection_case_id },
    });
    if (collectionCase) {
      const newBalance = Number(collectionCase.total_due) - totalPaid;

      await prisma.collectionCase.update({
        where: { id: payload.collection_case_id },
        data: {
          total_paid: totalPaid,
          balance: newBalance,
        },
      });
    }
  }

  // // Check if the accounts receivable exists
  // const accountsReceivable = await prisma.accountsReceivable.findUnique({
  //   where: { id: payload.collection_case_id, tenant_id: tenant_id },
  //   include: { debtor: true },
  // });

  // if (!accountsReceivable) {
  //   throw new Error("Accounts receivable not found");
  // }
  // // Verificar si hay un acuerdo de pago asociado
  // const collectionCaseAgreement = await prisma.collectionCaseAgreement.findFirst({
  //   where: {
  //     accountsReceivableId: payload.collection_case_id,
  //     accountsReceivable: {
  //       tenant_id: tenant_id,
  //     },
  //   },
  // });

  // let remainingAmount = payload.paymentAmount;

  // if (collectionCaseAgreement) {
  //   // Si vienen cuotas específicas en el payload
  //   if (payload.installmentIds && payload.installmentIds.length > 0) {
  //     for (const installmentId of payload.installmentIds) {
  //       if (remainingAmount <= 0) break;

  //       const installment = await prisma.installment.findUnique({
  //         where: { id: installmentId },
  //       });

  //       if (
  //         !installment ||
  //         installment.paymentAgreementId !== collectionCaseAgreement.id
  //       ) {
  //         throw new Error(`Invalid installment ID: ${installmentId}`);
  //       }

  //       const amountToPay = Math.min(
  //         installment.remainingAmount,
  //         remainingAmount
  //       );

  //       // Actualizar el estado de la cuota
  //       const newRemainingAmount = installment.remainingAmount - amountToPay;
  //       const newAmountPaid = installment.amountPaid + amountToPay;
  //       const newStatus =
  //         newRemainingAmount === 0
  //           ? "paid"
  //           : newAmountPaid > 0
  //           ? "partially_paid"
  //           : "pending";

  //       await prisma.installment.update({
  //         where: { id: installment.id },
  //         data: {
  //           amountPaid: newAmountPaid,
  //           remainingAmount: newRemainingAmount,
  //           paid: newRemainingAmount === 0,
  //           paidAt: newRemainingAmount === 0 ? new Date() : null,
  //           status: newStatus,
  //         },
  //       });

  //       // Crear el detalle del pago especificando información de la cuota
  //       const payment = await prisma.paymentDetail.create({
  //         data: {
  //           accountsReceivableId: payload.collection_case_id,
  //           paymentAgreementId: collectionCaseAgreement.id,
  //           paymentAmount: amountToPay,
  //           paymentMethod: payload.paymentMethod,
  //           reference_number: payload.reference_number,
  //           notes: `Installment ${installment.installmentNumber}: ${payload.notes}`,
  //           created_at: new Date(),
  //           payment_date: new Date(),
  //         },
  //       });

  //       remainingAmount -= amountToPay;

  //       // Distribuir el pago entre capital, interés, impuestos, cobranza, etc.
  //       await distributePayment(payment.id);
  //     }
  //   }

  //   if (payload.initialPaymentStatus === "pending") {
  //     const amountToApply = payload.initialPayment || 0;

  //     if (amountToApply > 0) {
  //       // Crear el detalle del pago especificando información de la cuota
  //       await prisma.paymentDetail.create({
  //         data: {
  //           accountsReceivableId: payload.collection_case_id,
  //           paymentAgreementId: collectionCaseAgreement.id,
  //           paymentAmount: amountToApply,
  //           paymentMethod: payload.paymentMethod,
  //           reference_number: payload.reference_number,
  //           notes: `Initial Payment: ${payload.notes}`,
  //           created_at: new Date(),
  //           payment_date: new Date(),
  //         },
  //       });
  //     }

  //     // SI SE CREO EL PAGO SE ACTUALIZA EL ACUERDO DE PAGO
  //     await prisma.collectionCaseAgreement.update({
  //       where: { id: collectionCaseAgreement.id },
  //       data: {
  //         initialPaymentStatus:
  //           amountToApply === collectionCaseAgreement.initialPayment
  //             ? "completed"
  //             : "pending",
  //       },
  //     });
  //   }

  //   // Enviar el monto restante para recalcular el saldo pendiente, incluso si es cero
  //   await recalculateInvoiceBalance(tenant_id, payload.collection_case_id);
  // } else {
  //   // Si no hay acuerdo de pago, registrar el pago directamente
  //   const payment = await prisma.paymentDetail.create({
  //     data: {
  //       accountsReceivableId: payload.collection_case_id,
  //       paymentAmount: payload.paymentAmount,
  //       paymentMethod: payload.paymentMethod,
  //       reference_number: payload.reference_number,
  //       notes: payload.notes,
  //       created_at: new Date(),
  //       payment_date: new Date(),
  //     },
  //   });

  //   // Recalcular el saldo pendiente de la factura
  //   await recalculateInvoiceBalance(tenant_id, payload.collection_case_id);

  //   // Distribuir el pago entre capital, interés, impuestos, cobranza, etc.
  //   await distributePayment(payment.id);
  // }

  // await sendBetalingsbewijs(
  //   accountsReceivable.debtor?.fullname || "",
  //   payload.paymentMethod,
  //   payload.paymentAmount,
  //   payload.reference_number,
  //   accountsReceivable.debtor?.email || "",
  //   accountsReceivable.invoice_number
  // ).catch((error) => {
  //   console.error("Error sending Betalingsbewijs:", error);
  // });

  return { success: true };
};

export const getAllPayments = async (tenant_id: string) => {
  // const payments = await prisma.paymentDetail.findMany({
  //   where: {
  //     accountsReceivable: {
  //       tenant_id: tenant_id,
  //     },
  //   },
  //   include: {
  //     accountsReceivable: true,
  //   },
  // });
  // return payments;
};

export const getPaymentsByInvoice = async (
  collection_case_id: string
): Promise<Payment[]> => {
  const payments = await prisma.collectionCasePayment.findMany({
    where: { collection_case_id: collection_case_id },
  });

  return payments.map((payment) => ({
    ...payment,
    amount:
      typeof payment.amount === "object" && "toNumber" in payment.amount
        ? payment.amount.toNumber()
        : Number(payment.amount),
    method:
      payment.method === "CREDIT_CARD"
        ? "CREDIT_CARD"
        : (payment.method as "TRANSFER" | "CREDIT_CARD"),
    payment_date: payment.payment_date.toISOString(),
    reference_number: payment.reference_number ?? undefined,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
  }));
};

export const getPaymentsByDebtor = async (
  tenant_id: string,
  debtor_id: string
) => {
  // const payments = await prisma.paymentDetail.findMany({
  //   where: {
  //     accountsReceivable: {
  //       debtor_id: debtor_id,
  //       tenant_id: tenant_id,
  //     },
  //   },
  //   include: {
  //     accountsReceivable: true,
  //   },
  // });
  // return payments;
};

export const getPaymentById = async (paymentId: string) => {
  // const payment = await prisma.paymentDetail.findUnique({
  //   where: { id: paymentId },
  //   include: {
  //     accountsReceivable: {
  //       include: {
  //         debtor: true,
  //       },
  //     },
  //   },
  // });
  // if (!payment) {
  //   throw new Error("Payment not found");
  // }
  // return payment;
};

export const updatePayment = async (
  tenant_id: string,
  paymentId: string,
  data: any
) => {
  // const payment = await prisma.paymentDetail.findUnique({
  //   where: { id: paymentId, accountsReceivable: { tenant_id: tenant_id } },
  // });
  // if (!payment) {
  //   throw new Error("Payment not found");
  // }
  // const updatedPayment = await prisma.paymentDetail.update({
  //   where: { id: paymentId },
  //   data,
  // });
  // // Recalculate the invoice balance
  // await recalculateInvoiceBalance(tenant_id, payment.accountsReceivableId);
  // return updatedPayment;
};

export const deletePayment = async (tenant_id: string, paymentId: string) => {
  // const payment = await prisma.paymentDetail.findUnique({
  //   where: { id: paymentId, accountsReceivable: { tenant_id: tenant_id } },
  // });
  // if (!payment) {
  //   throw new Error("Payment not found");
  // }
  // const collection_case_id = payment.accountsReceivableId;
  // await prisma.paymentDetail.delete({
  //   where: { id: paymentId },
  // });
  // // Recalculate the invoice balance
  // await recalculateInvoiceBalance(tenant_id, collection_case_id);
};

// 9. Validar consistencia: Recalcular automáticamente el saldo pendiente de una factura
export const recalculateInvoiceBalance = async (
  tenant_id: string,
  collection_case_id: string
) => {
  //
  // const payments = await prisma.paymentDetail.findMany({
  //   where: {
  //     accountsReceivableId: collection_case_id,
  //     accountsReceivable: { tenant_id: tenant_id },
  //   },
  // });
  // // Sumar todos los pagos realizados
  // const totalPaid = payments.reduce(
  //   (sum, payment) => sum + payment.paymentAmount,
  //   0
  // );
  // // Obtener la factura asociada
  // const invoice = await prisma.accountsReceivable.findUnique({
  //   where: { id: collection_case_id, tenant_id: tenant_id },
  // });
  // if (!invoice) {
  //   throw new Error("Invoice not found");
  // }
  // const remainingBalance = invoice.invoiceAmount - totalPaid;
  // await prisma.accountsReceivable.update({
  //   where: { id: collection_case_id },
  //   data: {
  //     remainingBalance: remainingBalance,
  //     // receivableStatus: remainingBalance <= 0 ? "paid" : "pending",
  //   },
  // });
  // // Recalcular el saldo pendiente del acuerdo de pago, si existe
  // if (invoice.paymentAgreementId) {
  //   recalculatePaymentAgreement(tenant_id, invoice.paymentAgreementId).catch(
  //     (error) => {
  //       console.error("Error recalculating payment agreement:", error);
  //     }
  //   );
  // }
  // // Si hay un acuerdo de pago, actualizar el saldo restante
  // await updateInvoiceStatusIfPaid(collection_case_id);
};

// Recalcular los valores de PaymentAgreement
export const recalculatePaymentAgreement = async (
  tenant_id: string,
  paymentAgreementId: string
) => {
  // Obtener el acuerdo de pago
  // const collectionCaseAgreement = await prisma.collectionCaseAgreement.findUnique({
  //   where: { id: paymentAgreementId },
  //   include: {
  //     Installments: true,
  //     PaymentDetail: true,
  //   },
  // });
  // if (!collectionCaseAgreement) {
  //   throw new Error("Payment agreement not found");
  // }
  // // Obtener todos los pagos relacionados con el acuerdo de pago
  // const payments = await prisma.paymentDetail.findMany({
  //   where: {
  //     paymentAgreementId: paymentAgreementId,
  //     accountsReceivable: { tenant_id: tenant_id },
  //   },
  // });
  // // Calcular el total pagado
  // const totalPaid = payments.reduce(
  //   (sum, payment) => sum + payment.paymentAmount,
  //   0
  // );
  // // Calcular el saldo restante
  // const remainingBalance = collectionCaseAgreement.total_amount - totalPaid;
  // // Actualizar el acuerdo de pago
  // await prisma.collectionCaseAgreement.update({
  //   where: { id: paymentAgreementId },
  //   data: {
  //     totalPaid: parseFloat(totalPaid.toFixed(2)),
  //     remainingBalance: parseFloat(remainingBalance.toFixed(2)),
  //     paymentStatus: remainingBalance <= 0 ? "completed" : "active",
  //   },
  // });
  // return { success: true };
};

// 10. Validar consistencia: Actualizar estado de factura cuando ya se pagó completamente
export const updateInvoiceStatusIfPaid = async (collection_case_id: string) => {
  // const invoice = await prisma.accountsReceivable.findUnique({
  //   where: { id: collection_case_id },
  // });
  // if (!invoice) {
  //   throw new Error("Invoice not found");
  // }
  // // Sumamos todos los fees de cobranza y ABB
  // const totalFees = invoice.clientCollectionAmount + invoice.clientAbbAmount;
  // // + invoice.adminCollectionAmount
  // // + invoice.adminAbbAmount;
  // // Sumamos el monto de la factura con los fees
  // const totalWithFees = invoice.invoiceAmount + totalFees;
  // const payments = await prisma.paymentDetail.findMany({
  //   where: { accountsReceivableId: collection_case_id },
  // });
  // const totalPaid = payments.reduce(
  //   (sum, payment) => sum + payment.paymentAmount,
  //   0
  // );
  // console.log("Total Pagado:", totalPaid);
  // console.log("Total con Fees:", totalWithFees);
  // if (totalPaid >= totalWithFees) {
  //   await prisma.accountsReceivable.update({
  //     where: { id: collection_case_id },
  //     data: {
  //       receivableStatus: "paid",
  //       collectionStatus: "settled",
  //       remainingBalance: 0,
  //     },
  //   });
  //   // Si hay un acuerdo de pago, actualizar el estado
  //   if (invoice.hasPaymentAgreement && invoice.paymentAgreementId) {
  //     await prisma.collectionCaseAgreement.update({
  //       where: { id: invoice.paymentAgreementId },
  //       data: {
  //         paymentStatus: "completed",
  //         remainingBalance: 0,
  //       },
  //     });
  //   }
  // }
};

// 11. Distribuir pagos entre capital, interés, impuestos, cobranza, etc.
export const distributePayment = async (paymentDetailId: string) => {
  // // Fetch the payment detail and associated invoice
  // const paymentDetail = await prisma.paymentDetail.findUnique({
  //   where: { id: paymentDetailId },
  //   include: { accountsReceivable: true },
  // });
  // if (!paymentDetail) {
  //   throw new Error("Payment detail not found");
  // }
  // // Check if the payment detail is associated with an invoice
  // const invoice = paymentDetail.accountsReceivable;
  // if (!invoice) {
  //   throw new Error("Associated invoice not found");
  // }
  // let remainingAmount = paymentDetail.paymentAmount;
  // const paymentApplications: IPaymentApplication[] = [];
  // // Fetch existing payment applications for the invoice
  // const existingApplications = await prisma.paymentApplication.findMany({
  //   where: { accountsReceivableId: invoice.id },
  // });
  // const appliedAmounts = existingApplications.reduce((acc, app) => {
  //   acc[app.appliedTo] = (acc[app.appliedTo] || 0) + app.amountApplied;
  //   return acc;
  // }, {} as Record<string, number>);
  // // Apply to administrative fees (cobranza)
  // if (
  //   remainingAmount > 0 &&
  //   (appliedAmounts["ADMIN_COLLECTION_FEE"] || 0) <
  //     invoice.adminCollectionAmount
  // ) {
  //   const amountToApply = Math.min(
  //     invoice.adminCollectionAmount -
  //       (appliedAmounts["ADMIN_COLLECTION_FEE"] || 0),
  //     remainingAmount
  //   );
  //   paymentApplications.push({
  //     paymentDetailId,
  //     accountsReceivableId: invoice.id,
  //     amountApplied: amountToApply,
  //     appliedTo: "ADMIN_COLLECTION_FEE",
  //   });
  //   remainingAmount -= amountToApply;
  // }
  // // Apply to admin ABB fee (intereses de mora)
  // if (
  //   remainingAmount > 0 &&
  //   (appliedAmounts["ADMIN_ABB_FEE"] || 0) < invoice.adminAbbAmount
  // ) {
  //   const amountToApply = Math.min(
  //     invoice.adminAbbAmount - (appliedAmounts["ADMIN_ABB_FEE"] || 0),
  //     remainingAmount
  //   );
  //   paymentApplications.push({
  //     paymentDetailId,
  //     accountsReceivableId: invoice.id,
  //     amountApplied: amountToApply,
  //     appliedTo: "ADMIN_ABB_FEE",
  //   });
  //   remainingAmount -= amountToApply;
  // }
  // // Apply to client collection fee (cobranza)
  // if (
  //   remainingAmount > 0 &&
  //   (appliedAmounts["CLIENT_COLLECTION_FEE"] || 0) <
  //     invoice.clientCollectionAmount
  // ) {
  //   const amountToApply = Math.min(
  //     invoice.clientCollectionAmount -
  //       (appliedAmounts["CLIENT_COLLECTION_FEE"] || 0),
  //     remainingAmount
  //   );
  //   paymentApplications.push({
  //     paymentDetailId,
  //     accountsReceivableId: invoice.id,
  //     amountApplied: amountToApply,
  //     appliedTo: "CLIENT_COLLECTION_FEE",
  //   });
  //   remainingAmount -= amountToApply;
  // }
  // // Apply to client ABB fee (intereses de mora)
  // if (
  //   remainingAmount > 0 &&
  //   (appliedAmounts["CLIENT_ABB_FEE"] || 0) < invoice.clientAbbAmount
  // ) {
  //   const amountToApply = Math.min(
  //     invoice.clientAbbAmount - (appliedAmounts["CLIENT_ABB_FEE"] || 0),
  //     remainingAmount
  //   );
  //   paymentApplications.push({
  //     paymentDetailId,
  //     accountsReceivableId: invoice.id,
  //     amountApplied: amountToApply,
  //     appliedTo: "CLIENT_ABB_FEE",
  //   });
  //   remainingAmount -= amountToApply;
  // }
  // // Apply to interest (intereses de mora)
  // if (remainingAmount > 0) {
  //   if (
  //     invoice.interestFrozenAmount &&
  //     (appliedAmounts["INTEREST"] || 0) < invoice.interestFrozenAmount
  //   ) {
  //     const amountToApply = Math.min(
  //       invoice.interestFrozenAmount - (appliedAmounts["INTEREST"] || 0),
  //       remainingAmount
  //     );
  //     paymentApplications.push({
  //       paymentDetailId,
  //       accountsReceivableId: invoice.id,
  //       amountApplied: amountToApply,
  //       appliedTo: "INTEREST",
  //     });
  //     remainingAmount -= amountToApply;
  //   }
  // }
  // // Apply to capital (capital original)
  // if (remainingAmount > 0) {
  //   const amountToApply = Math.min(invoice.invoiceAmount, remainingAmount);
  //   paymentApplications.push({
  //     paymentDetailId,
  //     accountsReceivableId: invoice.id,
  //     amountApplied: amountToApply,
  //     appliedTo: "CAPITAL",
  //   });
  //   remainingAmount -= amountToApply;
  // }
  // // Save payment applications once all the amount is distributed
  // if (paymentApplications.length > 0) {
  //   for (const application of paymentApplications) {
  //     await prisma.paymentApplication.create({
  //       data: {
  //         paymentDetailId: application.paymentDetailId,
  //         accountsReceivableId: application.accountsReceivableId,
  //         amountApplied: application.amountApplied,
  //         appliedTo: application.appliedTo,
  //         created_at: new Date(),
  //         updated_at: new Date(),
  //       },
  //     });
  //   }
  // }
  // return { success: true, paymentApplications };
};
