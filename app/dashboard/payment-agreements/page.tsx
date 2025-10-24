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
    if (!session?.user?.tenant_id) return;

    const pending = await getPaymentAgreements({
      tenant_id: session.user.tenant_id,
      status: "PENDING",
    });

    const processed = await getPaymentAgreements({
      tenant_id: session.user.tenant_id,
    });

    setAgreementsPending(pending);
    setAgreementsProcessed(processed.filter((a) => a.status !== "PENDING"));
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleApprove = (id: string) => {
    AlertService.showConfirm(
      "¿Wilt u deze betalingsregeling accepteren?",
      "",
      "JA",
      "NEE"
    ).then(async (confirmed) => {
      if (confirmed) {
        await updatePaymentAgreement(id, {
          status: $Enums.AgreementStatus.ACCEPTED,
        });
        await notifyInfo("Acuerdo de pago aprobado con éxito.");
        await fetchAgreements();
      }
    });
  };

  const handleReject = (id: string) => {
    AlertService.showConfirm(
      "¿Bent u zeker dat u deze wilt annuleren?",
      "",
      "JA",
      "NEE"
    ).then(async (confirmed) => {
      if (confirmed) {
        console.log("Rejection reason:", value);
        await updatePaymentAgreement(id, {
          status: $Enums.AgreementStatus.REJECTED,
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

      if (!data.collection_case_id) {
        notifyError("Collection Case ID is required");
        return;
      }

      if (!data.start_date) {
        notifyError("Start date is required");
        return;
      }

      if (data.start_date < new Date()) {
        notifyError("La fecha de inicio debe ser mayor a la fecha actual");
        return;
      }

      if (!data.debtor_id) {
        notifyError("Debtor ID is required");
        return;
      }

      const exists = await existsPaymentAgreement(data.collection_case_id);
      if (exists) {
        notifyError("Ya existe un acuerdo de pago para esta collection");
        return;
      }

      const agreementUpdate: PaymentAgreementUpdate = {
        collection_case_id: data.collection_case_id || "",
        total_amount: Number(data.total_amount),
        installments_count: Number(data.installments_count),
        installment_amount: Number(data.installment_amount),
        start_date: data.start_date,
        debtor_id: data.debtor_id,
        status: data.status || $Enums.AgreementStatus.COUNTEROFFER,
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
      <Box
        sx={{
          width: "100%",
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          BETALINGSREGELING
        </Typography>
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
