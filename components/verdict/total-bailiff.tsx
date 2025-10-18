import { Typography } from "@mui/material";
import { useWatch } from "react-hook-form";

const TotalBailiff: React.FC<{ control: any }> = ({ control }) => {
  const bailiffServices = useWatch({ control, name: "bailiffServices" });
  interface VerdictBailiffItem {
    serviceCost?: number;
    // Add other properties if needed
  }

  const total =
    (bailiffServices as VerdictBailiffItem[] | undefined)?.reduce(
      (sum: number, item: VerdictBailiffItem) => sum + (item?.serviceCost ?? 0),
      0
    ) ?? 0;

  return (
    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
      Totaal ${Number(total).toFixed(2)}
    </Typography>
  );
};

export default TotalBailiff;
