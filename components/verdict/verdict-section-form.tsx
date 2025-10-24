import React, { useEffect } from "react";

import { Autocomplete, Box, Grid, IconButton, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";

import { Verdict } from "@/lib/validations/verdict";
import { DebtorBase } from "@/lib/validations/debtor";
import { getAllDebtors } from "@/app/actions/debtor";

interface VerdictSectionFormProps {
  onOpenModalDebtor: () => void;
  onSelectDebtor: (debtor: DebtorBase | null) => void;
  debtorSelected: DebtorBase | null;
}

const VerdictSectionForm: React.FC<VerdictSectionFormProps> = ({
  onOpenModalDebtor,
  onSelectDebtor,
  debtorSelected,
}) => {
  const [debtors, setDebtors] = React.useState<DebtorBase[]>([]);

  const {
    control,
    formState: { errors },
  } = useFormContext<Verdict>();

  const fetchDebtors = async () => {
    const response = await getAllDebtors();
    setDebtors(response);
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4, md: 12 }}>
          <Controller
            name="invoice_number"
            control={control}
            render={({ field }) => (
              <TextField
                label="Beschrijving Vonnis"
                size="small"
                fullWidth
                {...field}
                value={field.value ?? ""}
                error={!!errors.invoice_number}
                helperText={errors.invoice_number?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 3 }}>
          <Controller
            name="creditor_name"
            control={control}
            render={({ field }) => (
              <TextField
                label="Naam Schuldeiser"
                size="small"
                fullWidth
                {...field}
                value={field.value ?? ""}
                error={!!errors.creditor_name}
                helperText={errors.creditor_name?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Controller
              name="debtor_id"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Autocomplete
                  options={debtors}
                  getOptionLabel={(option) => option?.fullname ?? ""}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={debtors.find((debtor) => debtor.id === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.id : null);

                    if (newValue) {
                      const debtorSelected: DebtorBase = {
                        id: newValue?.id,
                        fullname: newValue?.fullname,
                        email: newValue?.email,
                        phone: newValue?.phone || "",
                        address: newValue?.address || "",
                        identification_type: "DNI",
                        identification: newValue?.identification || "",
                        tenant_id: newValue?.tenant_id || "",
                        total_income: newValue?.total_income ?? 0,
                      };

                      onSelectDebtor(debtorSelected);
                    } else {
                      onSelectDebtor(null);
                    }
                  }}
                  fullWidth
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.fullname}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={ref}
                      size="small"
                      label="Naam Schuldenaar"
                      fullWidth
                      error={!!errors.debtor_id}
                      helperText={errors.debtor_id?.message}
                    />
                  )}
                />
              )}
            />
            <IconButton aria-label="toggle password visibility" edge="end">
              {debtorSelected ? (
                <EditIcon onClick={onOpenModalDebtor} />
              ) : (
                <PersonAddIcon onClick={onOpenModalDebtor} />
              )}
            </IconButton>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <Controller
            name="registration_number"
            control={control}
            render={({ field }) => (
              <TextField
                label="Zaaknummer"
                size="small"
                fullWidth
                {...field}
                value={field.value ?? ""}
                error={!!errors.registration_number}
                helperText={errors.registration_number?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Controller
            name="sentence_amount"
            control={control}
            render={({ field }) => (
              <TextField
                label="Vorderingsbedrag"
                size="small"
                type="number"
                fullWidth
                {...field}
                value={field.value ?? ""}
                error={!!errors.sentence_amount}
                helperText={errors.sentence_amount?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Controller
            name="sentence_date"
            control={control}
            render={({ field }) => (
              <TextField
                label="Datum Uitspraak"
                type="date"
                fullWidth
                size="small"
                {...field}
                value={field.value ?? ""}
                error={!!errors.sentence_date}
                helperText={errors.sentence_date?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <Controller
            name="procesal_cost"
            control={control}
            render={({ field }) => (
              <TextField
                label="Overige proceskosten"
                size="small"
                type="number"
                fullWidth
                {...field}
                value={field.value ?? ""}
                error={!!errors.procesal_cost}
                helperText={errors.procesal_cost?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VerdictSectionForm;
