"use client";
import { useEffect, useState } from "react";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { PaymentAgreementResponse } from "@/lib/validations/payment-agreement";
import {
  getPaymentAgreements,
  updatePaymentAgreement,
} from "@/app/actions/payment-agreement";
import TabPanel from "@/components/ui/tab-panel";
import { AlertService } from "@/lib/alerts";
import { $Enums } from "@/prisma/generated/prisma";
import { notifyInfo } from "@/lib/notifications";
import { useSession } from "next-auth/react";
import { AgreementTableApprove } from "@/components/agreements/agreement-table-approve";
import AgreementTable from "@/components/agreements/agreement-table";

const PaymentAgreementsPage = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState(0);
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
          status: $Enums.PaymentAgreementStatus.ACTIVE,
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
        await updatePaymentAgreement(id, {
          status: $Enums.PaymentAgreementStatus.REJECTED,
          comment: value,
        });
        await notifyInfo("Acuerdo de pago rechazado");
        await fetchAgreements();
      }
    });
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
            handleApprove={handleApprove}
            handleReject={handleReject}
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
