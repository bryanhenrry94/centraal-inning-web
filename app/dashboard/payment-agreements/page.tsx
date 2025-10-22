"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { PaymentAgreement } from "@/lib/validations/payment-agreement";
import {
  getPaymentAgreements,
  updatePaymentAgreement,
} from "@/app/actions/payment-agreement";
import TabPanel from "@/components/ui/tab-panel";
import AgreementTable from "@/components/agreements/agreement-table";
import PendingRequestCard from "@/components/agreements/pending-request-card";
import { AlertService } from "@/lib/alerts";
import { $Enums } from "@/prisma/generated/prisma";
import { notifyInfo } from "@/lib/notifications";
import { useSession } from "next-auth/react";

const PaymentAgreementsPage = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState(0);
  const [agreementsPending, setAgreementsPending] = useState<
    PaymentAgreement[]
  >([]);
  const [agreementsProcessed, setAgreementsProcessed] = useState<
    PaymentAgreement[]
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
          {agreementsPending.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <TaskAltIcon fontSize="large" color="disabled" />
              <br />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Geen lopende verzoeken om betalingsregelingen.
              </Typography>
            </Paper>
          )}

          <Grid container spacing={2}>
            {agreementsPending.map((agreement) => (
              <Grid size={{ xs: 12, sm: 6, md: 12 }} key={agreement.id}>
                <PendingRequestCard
                  paymentAgreement={agreement}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {agreementsProcessed.map((agreement) => (
              <Grid size={{ xs: 12, sm: 6, md: 12 }} key={agreement.id}>
                <PendingRequestCard
                  paymentAgreement={agreement}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
    </Container>
  );
};
export default PaymentAgreementsPage;
