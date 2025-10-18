import { formatCurrency } from "@/common/utils/general";
import { Box, Paper, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

interface VerdictTotalsProps {}

const VerdictTotals: React.FC<VerdictTotalsProps> = () => {
  const { control } = useFormContext();

  // const verdictInterest = useWatch({ control, name: "verdictInterest" });
  const sentenceAmount = useWatch({ control, name: "sentenceAmount" });
  // const verdictEmbargo = useWatch({ control, name: "verdictEmbargo" });
  const procesalCost = useWatch({ control, name: "procesalCost" });

  interface VerdictInterestItem {
    totalInterest?: number;
    // add other fields if needed
  }

  interface VerdictEmbargoItem {
    bailiffAmount?: number;
    // add other fields if needed
  }

  interface VerdictBailiffItem {
    serviceCost?: number;
    // add other fields if needed
  }

  const verdictInterest: VerdictInterestItem[] = useWatch({
    control,
    name: "verdictInterest",
  });
  const verdictEmbargo: VerdictEmbargoItem[] = useWatch({
    control,
    name: "verdictEmbargo",
  });

  const bailiffServices: VerdictBailiffItem[] = useWatch({
    control,
    name: "bailiffServices",
  });

  const totalInterest: number =
    verdictInterest?.reduce(
      (sum: number, item: VerdictInterestItem) =>
        sum + (item?.totalInterest ?? 0),
      0
    ) ?? 0;

  const totalEmbargoAmount =
    verdictEmbargo?.reduce(
      (sum, item) => sum + (item?.bailiffAmount ?? 0),
      0
    ) ?? 0;

  const totalBailiffAmount =
    bailiffServices?.reduce((sum, item) => sum + (item?.serviceCost ?? 0), 0) ??
    0;

  return (
    <Box
      sx={{
        mt: 8.5,
        display: "flex",
        justifyContent: "right",
        width: "100%",
      }}
    >
      <Paper
        component="section"
        sx={{
          mt: 2,
          elevation: 1,
          borderRadius: 1,
          overflow: "hidden",
          mb: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            bgcolor: "#eeeeee",
            // color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, width: "100%", textAlign: "center" }}
          >
            Overzicht
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mt: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gridColumn: "span 2",
              }}
            >
              <Typography>Hoofdsom:</Typography>
              <Typography fontWeight="600">
                {sentenceAmount
                  ? formatCurrency(Number(sentenceAmount))
                  : "$0.00"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gridColumn: "span 2",
              }}
            >
              <Typography>Rente:</Typography>
              <Typography fontWeight="600">
                {totalInterest
                  ? formatCurrency(Number(totalInterest))
                  : "$0.00"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gridColumn: "span 2",
              }}
            >
              <Typography>Overige Proceskosten:</Typography>
              <Typography fontWeight="600">
                {procesalCost ? formatCurrency(Number(procesalCost)) : "$0.00"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gridColumn: "span 2",
              }}
            >
              <Typography>Deurwaarder kosten:</Typography>
              <Typography fontWeight="600">
                {totalBailiffAmount
                  ? formatCurrency(Number(totalBailiffAmount))
                  : "$0.00"}
              </Typography>
            </Box>
            <Box
              sx={{
                gridColumn: "span 2",
                borderTop: 1,
                borderColor: "divider",
                pt: 2,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                }}
              >
                <Typography variant="h6">Totaal:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(
                    Number(sentenceAmount ?? 0) +
                      Number(totalInterest ?? 0) +
                      Number(totalBailiffAmount ?? 0) +
                      Number(totalEmbargoAmount ?? 0) +
                      Number(procesalCost ?? 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerdictTotals;
