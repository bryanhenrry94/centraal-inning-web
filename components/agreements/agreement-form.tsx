import { PaymentAgreementCreate } from "@/lib/validations/payment-agreement";
import { Box, Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

interface AgreementFormProps {
  initialData?: PaymentAgreementCreate;
  onSubmit: (data: PaymentAgreementCreate) => void;
  loading?: boolean;
}

const AgreementForm: React.FC<AgreementFormProps> = ({
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<PaymentAgreementCreate | null>(
    initialData || null
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
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
        <TextField
          label="Total Amount"
          fullWidth
          type="number"
          value={formData?.totalAmount || ""}
          onChange={(e) =>
            setFormData({
              ...formData,

              installmentAmount: formData
                ? Number(e.target.value) / formData.installmentsCount
                : 0,

              totalAmount: Number(e.target.value),
            } as PaymentAgreementCreate)
          }
        />
        <TextField
          label="Installments Count"
          fullWidth
          type="number"
          value={formData?.installmentsCount || 0}
          onChange={(e) => {
            setFormData({
              ...formData,

              installmentAmount: formData
                ? formData.totalAmount / Number(e.target.value)
                : 0,

              installmentsCount: Number(e.target.value),
            } as PaymentAgreementCreate);
          }}
        />
        <TextField
          label="Installment Amount"
          fullWidth
          type="number"
          disabled
          value={formData?.installmentAmount || 0}
          onChange={(e) =>
            setFormData({
              ...formData,
              installmentAmount: Number(e.target.value),
            } as PaymentAgreementCreate)
          }
        />
        <TextField
          label="Start Date"
          fullWidth
          type="date"
          value={formData?.startDate.toISOString().split("T")[0] || ""}
          InputLabelProps={{ shrink: true }}
          onChange={(e) =>
            setFormData({
              ...formData,
              startDate: new Date(e.target.value),
            } as PaymentAgreementCreate)
          }
        />
        <Button variant="contained" color="primary" type="submit" loading={loading}>
          Submit
        </Button>
      </Box>
    </form>
  );
};
export default AgreementForm;
