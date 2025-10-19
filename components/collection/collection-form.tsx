"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  Autocomplete,
  TextField,
  Stack,
} from "@mui/material";
import {
  Controller,
  FormProvider,
  useForm,
  SubmitHandler,
} from "react-hook-form";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import { CollectionCaseCreate } from "@/lib/validations/collection";
import ModalSearchDebtor from "@/components/debtor/modal-debtor-search";
import { ModalFormDebtor } from "@/components/debtor/modal-debtor-form";
import { DebtorBase, DebtorCreate } from "@/lib/validations/debtor";
import { getParameterById } from "@/app/actions/parameter";
import { createCollectionCase } from "@/app/actions/collection";
import { notifyError, notifySuccess } from "@/lib/notifications";
import { useTenant } from "@/hooks/useTenant";
import { getAllDebtorsByTenantId } from "@/app/actions/debtor";
import { IParamGeneral } from "@/lib/validations/parameter";

const RegisterInvoice: React.FC = () => {
  const { tenant } = useTenant();
  const [_parameter, setParameters] = useState<IParamGeneral>();
  const [_ModalSearchDebtors, setModalSearchDebtors] = useState(false);
  const [_ModalFormDebtor, setModalFormDebtor] = useState({
    open: false,
    debtorId: "",
  });
  const [debtors, setDebtors] = useState<DebtorBase[]>([]);

  const methods = useForm<CollectionCaseCreate>({
    // resolver: zodResolver(CollectionCaseCreateSchema),
    // defaultValues: {
    //   debtorId: "",
    //   amountOriginal: 0,
    //   amountDue: 0,
    //   amountToReceive: 0,
    //   status: "PENDING",
    //   referenceNumber: "",
    //   issueDate: new Date() ?? undefined,
    //   dueDate: new Date() ?? undefined,
    // },
  });

  useEffect(() => {
    fetchDebtors();
    fetchParameter();
  }, [tenant?.id]);

  const fetchParameter = async () => {
    try {
      const result = await getParameterById(
        process.env.NEXT_PUBLIC_PARAMETER_ID ??
          "67f55fa0-8598-4ec9-9d5e-2fe980d82e6d"
      );

      if (!result) return;

      setParameters(result);
    } catch (error) {
      console.error("Error al obtener el parámetro:", error);
    }
  };

  const fetchDebtors = async () => {
    if (!tenant?.id) return;

    const result = await getAllDebtorsByTenantId(tenant?.id);
    console.log("result: ", result);
    setDebtors(result);
  };

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = methods;

  // const porcCobranza = demo?.porcCobranza ? demo?.porcCobranza : 0;
  const porcCobranza = _parameter?.porcCobranza ?? 0;
  const porcAbb = _parameter?.porcAbb ?? 0;

  const invoiceAmount = watch("amountOriginal") || 0;
  const subtotal = Number(invoiceAmount);
  const cobranza = (subtotal * porcCobranza) / 100; // 0.15
  const abbValue = (cobranza * porcAbb) / 100;
  const totalFinal = subtotal - cobranza - abbValue;

  const onSubmit: SubmitHandler<CollectionCaseCreate> = async (data) => {
    try {
      if (!tenant) return;

      // Ensure debtorId is not changed when updating other fields
      const submitData = { ...data, debtorId: data.debtorId };

      const newInvoice = await createCollectionCase(submitData, tenant?.id);
      reset();
      console.log("New invoice: ", newInvoice);
      notifySuccess("Factura guardada exitosamente");
    } catch (error) {
      console.error("Error: ", error);
      notifyError("Ocurrió un error al registrar la factura");
    }
  };

  const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const handleClickNewDebtor = () => {
    setModalFormDebtor({ open: true, debtorId: "" });
    setModalSearchDebtors(false); // Close search
  };

  const handleClickSearchDebtor = () => {
    setModalSearchDebtors(true);
  };

  const handleSetDebtor = (debtor: DebtorCreate) => {
    setModalSearchDebtors(false);
    setModalFormDebtor({ open: false, debtorId: "" }); // Close form modal]});
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(errors).map(([field, error]) => (
                <Typography key={field} color="error" variant="body2">
                  {`${field}: ${error?.message}`}
                </Typography>
              ))}

              <Controller
                name="referenceNumber"
                control={control}
                // defaultValue={""}
                render={({ field: { ref, ...field } }) => (
                  <TextField
                    inputRef={ref}
                    {...field}
                    fullWidth
                    label={"Factuurnummer"}
                    size="small"
                    variant="outlined"
                    error={!!errors.referenceNumber}
                    helperText={errors.referenceNumber?.message}
                    type={"text"}
                    required
                  />
                )}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Controller
                  name="debtorId"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      disablePortal
                      options={debtors}
                      getOptionLabel={(option) => option?.fullname ?? ""}
                      isOptionEqualToValue={(option, val) =>
                        option.id === val.id
                      }
                      value={
                        debtors.find((debtor) => debtor.id === value) || null
                      }
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.id : null);
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
                          label="Debiteurnaam"
                          size="small"
                          required
                        />
                      )}
                    />
                  )}
                />
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    onClick={handleClickSearchDebtor}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleClickNewDebtor}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <PersonIcon />
                  </IconButton>
                </Stack>
              </Box>
              <Controller
                name="amountOriginal"
                control={control}
                render={({ field: { ref, value, ...field } }) => (
                  <TextField
                    inputRef={ref}
                    {...field}
                    value={value ?? ""}
                    fullWidth
                    label={"Vorderingsbedrag"}
                    size="small"
                    variant="outlined"
                    error={!!errors.amountOriginal}
                    helperText={errors.amountOriginal?.message}
                    type="number"
                    required
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : Number(val));
                    }}
                  />
                )}
              />
              <Controller
                name={"issueDate"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    size="small"
                    label={"Datum vordering"}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.issueDate}
                    helperText={errors.issueDate?.message}
                    disabled
                    value={
                      value
                        ? typeof value === "string"
                          ? value
                          : new Date(value).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                )}
              />
              {/* <Controller
                name={"dueDate"}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    size="small"
                    label={"Fecha de Vencimiento"}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.dueDate}
                    helperText={errors.dueDate?.message}
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value
                          : new Date(field.value).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                  />
                )}
              /> */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Vordering:</Typography>
                      <Typography>{formatUSD(subtotal)}</Typography>
                    </Box>
                    {/* <Box display="flex" justifyContent="space-between">
                      <Typography>
                        Cobranza ({_parameter?.porcCobranza}%):
                      </Typography>
                      <Typography>{formatUSD(cobranza)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>ABB ({_parameter?.porcAbb}%):</Typography>
                      <Typography>{formatUSD(abbValue)}</Typography>
                    </Box> */}
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Factuur:</Typography>
                      <Typography>{`-${formatUSD(
                        cobranza + abbValue
                      )}`}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Te ontvangen:</Typography>
                      <Typography variant="h6">
                        {formatUSD(totalFinal)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Stack spacing={2} direction="row">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  fullWidth
                  sx={{ mt: 1 }}
                  color="primary"
                >
                  SAVE
                </Button>
                {/* <Button
                  variant="outlined"
                  startIcon={<CleaningServicesIcon />}
                  sx={{ mt: 1 }}
                  fullWidth
                  color="secondary"
                  onClick={() => reset()}
                >
                  LIMPIAR
                </Button> */}
              </Stack>
            </Box>
          </form>
        </FormProvider>
      </Box>

      <ModalSearchDebtor
        open={_ModalSearchDebtors}
        onClose={() => setModalSearchDebtors(false)}
        onSelect={handleSetDebtor}
        onEdit={(id: string) => {
          console.log("Editar deudor con ID:", id);
          setModalSearchDebtors(false);
          setModalFormDebtor({ open: true, debtorId: id }); // Open form modal for editing
        }}
      />

      <ModalFormDebtor
        open={_ModalFormDebtor.open}
        onClose={() => setModalFormDebtor({ open: false, debtorId: "" })}
        id={_ModalFormDebtor.debtorId} // Aquí puedes pasar el ID del deudor si estás editando
        onSave={handleSetDebtor}
      />
    </>
  );
};

export default RegisterInvoice;
