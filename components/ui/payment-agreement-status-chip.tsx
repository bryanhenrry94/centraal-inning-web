import { Chip } from "@mui/material";

const PaymentAgreementStatusChip = ({ status }: { status: string }) => {
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
    case "PENDING":
      label = "Open";
      color = "primary";
      break;
    case "ACTIVE":
      label = "In Behandeling";
      color = "info";
      break;
    case "OVERDUE":
      label = "Verlopen";
      color = "warning";
      break;
    case "PAID":
      label = "Betaald";
      color = "success";
      break;
    case "REJECTED":
      label = "Afgewezen";
      color = "error";
      break;
    case "CANCELLED":
      label = "Geannuleerd";
      color = "error";
      break;
  }

  return <Chip label={label} color={color} size="small" />;
};

export default PaymentAgreementStatusChip;
