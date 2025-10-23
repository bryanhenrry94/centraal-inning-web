// mui
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
// components
import { formatCurrency } from "@/common/utils/general";
import PaymentAgreementStatusChip from "@/components/ui/payment-agreement-status-chip";
import { PaymentAgreementResponse } from "@/lib/validations/payment-agreement";

interface AgreementTableApproveProps {
  agreements: PaymentAgreementResponse[];
  handleApprove: (agreementId: string) => void;
  handleReject: (agreementId: string) => void;
}

export const AgreementTableApprove = ({
  agreements,
  handleApprove,
  handleReject,
}: AgreementTableApproveProps) => {
  return (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {agreements.map((agreement) => (
            <TableRow key={agreement.id}>
              <TableCell align="center">
                <IconButton
                  color="primary"
                  onClick={() => handleApprove(agreement.id)}
                >
                  <ThumbUpAltIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => handleReject(agreement.id)}
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
                <PaymentAgreementStatusChip status={agreement.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
