import { Chip } from "@mui/material";

const CollectionStatusChip = ({ status }: { status: string }) => {
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
      color = "warning";
      break;
    case "IN_PROGRESS":
      label = "In Behandeling";
      color = "info";
      break;
    case "OVERDUE":
      label = "Verlopen";
      color = "error";
      break;
    case "PAID":
      label = "Betaald";
      color = "success";
      break;
    case "CANCELLED":
      label = "Geannuleerd";
      color = "secondary";
      break;
  }

  return <Chip label={label} color={color} size="small" />;
};

export default CollectionStatusChip;
