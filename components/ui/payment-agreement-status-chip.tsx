import { $Enums } from "@/prisma/generated/prisma";
import { Chip } from "@mui/material";

const PaymentAgreementStatusChip = ({
  status,
}: {
  status: $Enums.PaymentAgreementStatus;
}) => {
  let label = "Onbekend";
  let color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" = "default";

  switch (status) {
    case $Enums.PaymentAgreementStatus.PENDING:
      label = "Open";
      color = "primary";
      break;
    case $Enums.PaymentAgreementStatus.IN_NEGOTIATION:
      label = "In Onderhandeling";
      color = "info";
      break;
    case $Enums.PaymentAgreementStatus.COUNTEROFFER:
      label = "Tegenbod";
      color = "warning";
      break;
    case $Enums.PaymentAgreementStatus.ACCEPTED:
      label = "Geaccepteerd";
      color = "success";
      break;
    case $Enums.PaymentAgreementStatus.REJECTED:
      label = "Afgewezen";
      color = "error";
      break;
    case $Enums.PaymentAgreementStatus.CANCELLED:
      label = "Geannuleerd";
      color = "error";
      break;
    case $Enums.PaymentAgreementStatus.CLOSED:
      label = "Gesloten";
      color = "default";
      break;
    default:
      label = "Onbekend";
      color = "default";
      break;
  }

  return <Chip label={label} color={color} size="small" />;
};

export default PaymentAgreementStatusChip;
