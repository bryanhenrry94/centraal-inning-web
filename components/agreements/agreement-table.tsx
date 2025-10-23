import { formatCurrency, formatDate } from "@/common/utils/general";
import {
  Box,
  IconButton,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import MoreIcon from "@mui/icons-material/More";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { PaymentAgreementResponse } from "@/lib/validations/payment-agreement";
import { useState } from "react";
import { Installment } from "@/lib/validations/installment";
import {
  deletePaymentAgreement,
  getInstallmentsByAgreement,
} from "@/app/actions/payment-agreement";
import { AlertService } from "@/lib/alerts";
import { notifyInfo } from "@/lib/notifications";
import PaymentAgreementStatusChip from "../ui/payment-agreement-status-chip";

interface AgreementTableProps {
  agreements: PaymentAgreementResponse[];
  onDelete?: () => void;
}

const AgreementTable = ({ agreements, onDelete }: AgreementTableProps) => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleMoreDetails = async (agreementId: string) => {
    // Implement more details logic here
    const agreement = await getInstallmentsByAgreement(agreementId);
    setInstallments(agreement);
    console.log("More details for agreement:", agreement);
    handleOpenModal();
  };

  const handleDeleteAgreement = (agreementId: string) => {
    AlertService.showConfirm(
      "¿Estás seguro?",
      "Esta acción eliminará el registro.",
      "Sí, eliminar",
      "Cancelar"
    ).then(async (confirmed) => {
      if (confirmed) {
        await deletePaymentAgreement(agreementId);
        notifyInfo("Acuerdo de pago eliminado exitosamente");
        onDelete?.();
      }
    });
    return;
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table
          stickyHeader
          sx={{
            "& .MuiTableCell-root": {
              border: "1px solid #e0e0e0",
            },
          }}
          aria-label="tabla de embargo"
          size="small"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Datum
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Naam debiteur
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Referentie
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Totaal bedrag
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Aantal termijnen
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Termijnbedrag
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Eerste termijn datum
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Nalevingsstatus
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 50,
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Actie
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agreements?.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell component="th" scope="row" align="center">
                  {new Date(agreement.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {agreement.debtor?.fullname ?? "N/A"}
                </TableCell>
                <TableCell align="center">
                  {agreement.collectionCase.referenceNumber || "N/A"}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(agreement.totalAmount)}
                </TableCell>
                <TableCell align="center">
                  {agreement.installmentsCount}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(agreement.installmentAmount)}
                </TableCell>
                <TableCell align="center">
                  {formatDate(agreement.startDate.toString())}
                </TableCell>
                <TableCell align="center">
                  <PaymentAgreementStatusChip status={agreement.status} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1}>
                    <IconButton>
                      <MoreIcon
                        onClick={() => handleMoreDetails(agreement.id)}
                      />
                    </IconButton>
                    {agreement.status === "PENDING" && (
                      <IconButton>
                        <DeleteIcon
                          onClick={() => handleDeleteAgreement(agreement.id)}
                        />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper
          component="section"
          sx={{
            mt: 2,
            elevation: 1,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              px: 2,
              py: 1.5,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              OVEREENKOMSTGEGEVENS
            </Typography>
            <IconButton sx={{ color: "white" }}>
              <CloseIcon onClick={handleCloseModal} />
            </IconButton>
          </Box>
          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Vervaldatum</TableCell>
                    <TableCell align="right">Deel</TableCell>
                    <TableCell align="right">Bedrag</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {installments?.map((installment) => (
                    <TableRow
                      key={installment.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row" align="center">
                        {formatDate(installment.dueDate.toString())}
                      </TableCell>
                      <TableCell align="center">{installment.number}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(installment.amount)}
                      </TableCell>
                      <TableCell align="right">{installment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};
export default AgreementTable;
