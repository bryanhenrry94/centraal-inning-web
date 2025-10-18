import { Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

const TotalInterest: React.FC<{ control: Control<any> }> = ({ control }) => {
  interface VerdictInterestItem {
    totalInterest?: number;
    [key: string]: any;
  }

  const verdictInterest: VerdictInterestItem[] = useWatch({
    control,
    name: "verdictInterest",
  });

  const total: number =
    verdictInterest?.reduce(
      (sum: number, item: VerdictInterestItem) =>
        sum + (item?.totalInterest ?? 0),
      0
    ) ?? 0;

  return (
    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
      Totaal ${Number(total).toFixed(2)}
    </Typography>
  );
};

export default TotalInterest;
