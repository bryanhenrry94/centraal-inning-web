import { useEffect, useState } from "react";
// mui
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import PersonIcon from "@mui/icons-material/Person";
// action & validations
import { getCollectionViewById } from "@/app/actions/collection";
import { CollectionCaseView } from "@/lib/validations/collection";
import { PaymentAgreement } from "@/lib/validations/payment-agreement";
import { formatCurrency, formatDate } from "@/common/utils/general";
import PaymentAgreementStatusChip from "../ui/payment-agreement-status-chip";
import { $Enums } from "@/prisma/generated/prisma";

interface PendingRequestCardProps {
  collectionCaseAgreement: PaymentAgreement;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({
  collectionCaseAgreement,
  onApprove,
  onReject,
}) => {
  const [collectionCase, setCollectionCase] =
    useState<CollectionCaseView | null>(null);

  useEffect(() => {
    // Fetch collection case details if needed
    const fetchCollectionCase = async () => {
      const data = await getCollectionViewById(
        collectionCaseAgreement.collection_case_id
      );
      setCollectionCase(data);
    };
    fetchCollectionCase();
  }, [collectionCaseAgreement.collection_case_id]);

  const handleApprove = () => {
    onApprove?.(collectionCaseAgreement.id);
  };

  const handleReject = () => {
    onReject?.(collectionCaseAgreement.id);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5">
            Referencia #{collectionCase?.reference_number}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PersonIcon />
            <Typography variant="body1">
              {collectionCase?.debtor.fullname}
            </Typography>
          </Box>
        </Box>
        <PaymentAgreementStatusChip
          status={collectionCaseAgreement.status as $Enums.AgreementStatus}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 4, mt: 4 }}>
        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">Monto total</Typography>
            <Typography variant="h6">
              {formatCurrency(collectionCaseAgreement.total_amount)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">Cuotas</Typography>
            <Typography variant="h6">
              {collectionCaseAgreement.installments_count}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">Monto mensual</Typography>
            <Typography variant="h6">
              {formatCurrency(collectionCaseAgreement.installment_amount)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="body1">
        Fecha primer pago: {formatDate(collectionCaseAgreement.start_date.toString())}
      </Typography>
      {collectionCaseAgreement.status === "PENDING" && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ThumbUpAltIcon />}
              onClick={handleApprove}
              fullWidth
            >
              Aprobar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ThumbDownAltIcon />}
              onClick={handleReject}
              fullWidth
            >
              Rechazar
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};
export default PendingRequestCard;
