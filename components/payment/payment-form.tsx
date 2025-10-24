import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTenant } from "@/hooks/useTenant";
import { TextField, Button, MenuItem, Box, Autocomplete } from "@mui/material";
import { notifyError, notifyInfo } from "@/lib/notifications";

import {
  PaymentMethodEnum,
  PaymentCreateSchema,
  PaymentCreate,
} from "@/lib/validations/payment";
import { CollectionCase } from "@/lib/validations/collection";
import { registerPayment } from "@/app/actions/payment";
import { getAllCollectionCases } from "@/app/actions/collection";
import { $Enums } from "@/prisma/generated/prisma";

const PaymentForm = ({
  onSubmit,
}: {
  onSubmit?: (data: PaymentCreate) => void;
}) => {
  const [collections, setCollections] = React.useState<CollectionCase[]>([]);
  const { tenant } = useTenant();

  React.useEffect(() => {
    // Fetch collections from the API or any other source
    const fetchInvoices = async () => {
      if (!tenant) return;
      const data = await getAllCollectionCases(tenant.id);
      setCollections(data);
    };

    fetchInvoices();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PaymentCreateSchema),
    defaultValues: {
      collection_case_id: "",
      amount: 0,
      method: $Enums.PaymentMethod.TRANSFER,
      reference_number: "",
      payment_date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    },
  });

  const handleSavePayment = async (data: PaymentCreate) => {
    try {
      console.log("Payment Data:", data);
      // Implement the logic to save the payment data
      await registerPayment(data);
      notifyInfo("Payment registered successfully");
    } catch (error) {
      console.error("Error registering payment:", error);
      notifyError("Error registering payment");
    }
  };

  // Collect all error messages with field names
  const allErrorMessages = Object.entries(errors)
    .map(([key, err]) => (err?.message ? `${key}: ${String(err.message)}` : ""))
    .filter(Boolean);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit || handleSavePayment)}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {allErrorMessages.length > 0 && (
        <Box sx={{ color: "error.main", mb: 2 }}>
          {allErrorMessages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </Box>
      )}
      <Controller
        name="collection_case_id"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={collections}
            getOptionLabel={(option) =>
              option.id
                ? `${option.reference_number} - Saldo: $${option.amount_due}`
                : ""
            }
            onChange={(_, value) => field.onChange(value ? value.id : "")}
            value={collections.find((inv) => inv.id === field.value) || null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Invoice"
                error={!!errors.collection_case_id}
                helperText={errors.collection_case_id?.message}
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Amount"
            type="number"
            error={!!errors.amount}
            helperText={errors.amount?.message}
            required
          />
        )}
      />
      <Controller
        name="method"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Payment Method"
            error={!!errors.method}
            helperText={errors.method?.message}
            required
          >
            {PaymentMethodEnum.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name="reference_number"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Reference"
            error={!!errors.reference_number}
            helperText={errors.reference_number?.message}
          />
        )}
      />
      <Controller
        name="payment_date"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Paid At"
            type="datetime-local"
            error={!!errors.payment_date}
            helperText={errors.payment_date?.message}
            required
            InputLabelProps={{ shrink: true }}
          />
        )}
      />

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
};

export default PaymentForm;
