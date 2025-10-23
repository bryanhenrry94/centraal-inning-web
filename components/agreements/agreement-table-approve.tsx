"use client";
import React from "react";
// mui
import {
  Box,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// components
import { formatCurrency } from "@/common/utils/general";
import PaymentAgreementStatusChip from "@/components/ui/payment-agreement-status-chip";
import {
  PaymentAgreement,
  PaymentAgreementResponse,
} from "@/lib/validations/payment-agreement";
import AgreementForm from "./agreement-form";
import { $Enums } from "@/prisma/generated/prisma";

interface AgreementTableApproveProps {
  agreements: PaymentAgreementResponse[];
  onApprove: (agreementId: string) => void;
  onReject: (agreementId: string) => void;
  onUpdate: (data: Partial<PaymentAgreement>) => void;
  loading?: boolean;
}

export const AgreementTableApprove = ({
  agreements,
  onApprove,
  onReject,
  onUpdate,
  loading,
}: AgreementTableApproveProps) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [agreementSelected, setAgreementSelected] =
    React.useState<PaymentAgreementResponse | null>(null);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleUpdate = (data: Partial<PaymentAgreement>) => {
    handleCloseModal();
    onUpdate(data);
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
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Acties
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Datum
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Naam debiteur
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Totaal bedrag
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Aantal termijnen
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Bedrag per termijn
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Startdatum
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "secondary.main",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                align="center"
              >
                Tegenbod
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agreements.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => onApprove(agreement.id)}
                  >
                    <ThumbUpAltIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => onReject(agreement.id)}
                  >
                    <ThumbDownAltIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  {new Date(agreement.createdAt || "").toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {agreement.debtor
                    ? agreement.debtor.fullname
                    : "Sin deudor asignado"}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(agreement.totalAmount)}
                </TableCell>
                <TableCell align="center">
                  {agreement.installmentsCount}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(agreement.installmentAmount)}
                </TableCell>
                <TableCell align="center">
                  {new Date(agreement.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <PaymentAgreementStatusChip
                    status={agreement.status as $Enums.PaymentAgreementStatus}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton>
                    <EditIcon
                      onClick={() => {
                        setAgreementSelected(agreement);
                        handleOpenModal();
                      }}
                    />
                  </IconButton>
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
              OVEREENKOMST AANPASSEN
            </Typography>
            <IconButton sx={{ color: "white" }}>
              <CloseIcon onClick={handleCloseModal} />
            </IconButton>
          </Box>
          <AgreementForm
            initialData={{
              ...agreementSelected,
              status: $Enums.PaymentAgreementStatus.COUNTEROFFER,
            }}
            onSubmit={handleUpdate}
            loading={loading}
          />
        </Paper>
      </Modal>
    </>
  );
};
