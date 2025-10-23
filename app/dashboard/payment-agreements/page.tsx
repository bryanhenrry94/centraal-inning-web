"use client";
import { useEffect, useState } from "react";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import {
  PaymentAgreement,
  PaymentAgreementResponse,
  PaymentAgreementUpdate,
} from "@/lib/validations/payment-agreement";
import {
  existsPaymentAgreement,
  getPaymentAgreements,
  updatePaymentAgreement,
} from "@/app/actions/payment-agreement";
import TabPanel from "@/components/ui/tab-panel";
import { AlertService } from "@/lib/alerts";
import { $Enums } from "@/prisma/generated/prisma";
import { notifyError, notifyInfo } from "@/lib/notifications";
import { useSession } from "next-auth/react";
import { AgreementTableApprove } from "@/components/agreements/agreement-table-approve";
import AgreementTable from "@/components/agreements/agreement-table";

const PaymentAgreementsPage = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreementsPending, setAgreementsPending] = useState<
    PaymentAgreementResponse[]
  >([]);
  const [agreementsProcessed, setAgreementsProcessed] = useState<
    PaymentAgreementResponse[]
  >([]);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    if (!session?.user?.tenantId) return;

    const pending = await getPaymentAgreements({
      tenantId: session.user.tenantId,
      status: "PENDING",
    });

    const processed = await getPaymentAgreements({
      tenantId: session.user.tenantId,
    });

    setAgreementsPending(pending);
    setAgreementsProcessed(processed.filter((a) => a.status !== "PENDING"));
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleApprove = (id: string) => {
    AlertService.showConfirm(
      "¿Estás seguro?",
      "Esta acción aprobará el acuerdo de pago.",
      "Sí, aprobar",
      "Cancelar"
    ).then(async (confirmed) => {
      if (confirmed) {
        await updatePaymentAgreement(id, {
          status: $Enums.PaymentAgreementStatus.ACCEPTED,
        });
        await notifyInfo("Acuerdo de pago aprobado con éxito.");
        await fetchAgreements();
      }
    });
  };

  const handleReject = (id: string) => {
    AlertService.showConfirmWithInput(
      "¿Estás seguro?",
      "Esta acción rechazará el acuerdo de pago.",
      "Sí, rechazar",
      "Cancelar"
    ).then(async (value) => {
      if (value) {
        console.log("Rejection reason:", value);
        await updatePaymentAgreement(id, {
          status: $Enums.PaymentAgreementStatus.REJECTED,
          comment: value,
        });
        await notifyInfo("Acuerdo de pago rechazado");
        await fetchAgreements();
      }
    });
  };

  const handleUpdateAgreement = async (data: Partial<PaymentAgreement>) => {
    // Implement submission logic here
    try {
      setLoading(true);
      console.log("Agreement Data Submitted:", data);

      if (!data.id) {
        notifyError("Agreement ID is required");
        return;
      }

      if (!data.collectionCaseId) {
        notifyError("Collection Case ID is required");
        return;
      }

      if (!data.startDate) {
        notifyError("Start date is required");
        return;
      }

      if (data.startDate < new Date()) {
        notifyError("La fecha de inicio debe ser mayor a la fecha actual");
        return;
      }

      if (!data.debtorId) {
        notifyError("Debtor ID is required");
        return;
      }

      const exists = await existsPaymentAgreement(data.collectionCaseId);
      if (exists) {
        notifyError("Ya existe un acuerdo de pago para esta collection");
        return;
      }

      const agreementUpdate: PaymentAgreementUpdate = {
        collectionCaseId: data.collectionCaseId || "",
        totalAmount: Number(data.totalAmount),
        installmentsCount: Number(data.installmentsCount),
        installmentAmount: Number(data.installmentAmount),
        startDate: data.startDate,
        debtorId: data.debtorId,
        status: data.status || $Enums.PaymentAgreementStatus.COUNTEROFFER,
      };

      await updatePaymentAgreement(data.id, agreementUpdate);
      await fetchAgreements();

      notifyInfo("Payment agreement submitted successfully");
    } catch (error) {
      console.error("Error creating payment agreement:", error);
      notifyError("Error al crear el acuerdo de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Beheer van betalingsovereenkomsten
      </Typography>
      <Typography variant="body1" gutterBottom>
        Beheer en beheer de verzoeken om betalingsregelingen van debiteuren
      </Typography>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Tabs value={value} onChange={handleChange} aria-label="example tabs">
          <Tab
            value={0}
            label={`In behandeling (${agreementsPending.length})`}
            wrapped
          />
          <Tab value={1} label={`Verwerkt (${agreementsProcessed.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Box sx={{ mt: 2 }}>
          <AgreementTableApprove
            agreements={agreementsPending}
            onApprove={handleApprove}
            onReject={handleReject}
            onUpdate={handleUpdateAgreement}
            loading={loading}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ mt: 2 }}>
          <AgreementTable
            agreements={agreementsProcessed}
            onDelete={fetchAgreements}
          />
        </Box>
      </TabPanel>
    </Container>
  );
};
export default PaymentAgreementsPage;
