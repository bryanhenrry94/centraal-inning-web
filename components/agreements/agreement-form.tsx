import React, { useEffect, useState } from "react";
import { Box, Button, Slider, Typography } from "@mui/material";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
} from "@/lib/validations/payment-agreement";
import { formatCurrency, formatDate } from "@/common/utils/general";

interface AgreementFormProps {
  initialData?: Partial<PaymentAgreement>;
  onSubmit: (data: Partial<PaymentAgreement>) => void;
  loading?: boolean;
}

const AgreementForm: React.FC<AgreementFormProps> = ({
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<PaymentAgreement> | null>(
    initialData || null
  );

  useEffect(() => {
    if (initialData) {
      if (!initialData.totalAmount)
        initialData.totalAmount = Number(initialData.totalAmount);

      if (!initialData.installmentsCount)
        initialData.installmentsCount = Number(initialData.installmentsCount);

      setFormData({
        ...initialData,
        installmentAmount:
          initialData.totalAmount / initialData.installmentsCount,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" gutterBottom>
              Aantal Termijnen:
            </Typography>
            <Typography variant="h6" gutterBottom>
              {formData?.installmentsCount || 0}
            </Typography>
          </Box>
          <Box sx={{ width: "100%", px: 1 }}>
            <Slider
              name="installmentsCount"
              defaultValue={3}
              step={1}
              min={3}
              max={24}
              valueLabelDisplay="auto"
              value={formData?.installmentsCount || 0}
              onChange={(e, newValue) => {
                setFormData({
                  ...formData,

                  installmentAmount: formData
                    ? Number(formData.totalAmount) / Number(newValue)
                    : 0,

                  installmentsCount: Number(newValue),
                } as PaymentAgreementCreate);
              }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" gutterBottom>
              3 maanden
            </Typography>
            <Typography variant="caption" gutterBottom>
              24 maanden
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 1,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Totaal bedrag:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(formData?.totalAmount || 0)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Kosten:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formData?.installmentsCount ?? 0} betalingen
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Startdatum:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatDate(formData?.startDate?.toString() || "")}
            </Typography>
          </Box>

          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              pt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Betaling per maand:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(
                formData?.totalAmount && formData?.installmentsCount
                  ? formData.totalAmount / formData.installmentsCount
                  : 0
              )}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          loading={loading}
        >
          Save
        </Button>
      </Box>
    </form>
  );
};
export default AgreementForm;
