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

const InitialCollectionCaseCreate: CollectionCaseCreate = {
  debtorId: "",
  amountOriginal: 0,
  amountDue: 0,
  amountToReceive: 0,
  status: "PENDING",
  referenceNumber: "",
  issueDate: new Date() ?? undefined,
  dueDate: new Date() ?? undefined,
};

const RegisterInvoice: React.FC = () => {
  const { tenant } = useTenant();

  const [formData, setFormData] = useState<CollectionCaseCreate>(
    InitialCollectionCaseCreate
  );
  const [loading, setLoading] = useState(false);

  const [_parameter, setParameters] = useState<IParamGeneral>();
  const [_ModalSearchDebtors, setModalSearchDebtors] = useState(false);
  const [_ModalFormDebtor, setModalFormDebtor] = useState({
    open: false,
    debtorId: "",
  });
  const [debtors, setDebtors] = useState<DebtorBase[]>([]);

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
  // const porcCobranza = demo?.porcCobranza ? demo?.porcCobranza : 0;
  const porcCobranza = _parameter?.porcCobranza ?? 0;
  const porcAbb = _parameter?.porcAbb ?? 0;

  const invoiceAmount = formData.amountOriginal || 0;
  const subtotal = Number(invoiceAmount);
  const cobranza = (subtotal * porcCobranza) / 100; // 0.15
  const abbValue = (cobranza * porcAbb) / 100;
  const totalFinal = subtotal - cobranza - abbValue;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!tenant) return;

      setLoading(true);
      // Ensure debtorId is not changed when updating other fields
      const newInvoice = await createCollectionCase(formData, tenant?.id);
      setFormData(InitialCollectionCaseCreate);
      console.log("New invoice: ", newInvoice);
      notifySuccess("Factura guardada exitosamente");
    } catch (error) {
      console.error("Error: ", error);
      notifyError("Ocurrió un error al registrar la factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label={"Factuurnummer"}
              size="small"
              variant="outlined"
              type={"text"}
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  referenceNumber: e.target.value,
                })
              }
              required
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Autocomplete
                disablePortal
                options={debtors}
                getOptionLabel={(option) => option?.fullname ?? ""}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                value={
                  debtors.find((debtor) => debtor.id === formData.debtorId) ||
                  null
                }
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    debtorId: newValue ? newValue.id : "",
                  });
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
            <TextField
              fullWidth
              label={"Vorderingsbedrag"}
              size="small"
              variant="outlined"
              type="number"
              required
              value={formData.amountOriginal ?? ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  amountOriginal: Number(e.target.value),
                });
              }}
            />
            <TextField
              type="date"
              fullWidth
              size="small"
              label={"Datum vordering"}
              InputLabelProps={{ shrink: true }}
              disabled
              value={
                formData.issueDate
                  ? formData.issueDate instanceof Date
                    ? formData.issueDate.toISOString().slice(0, 10)
                    : new Date(formData.issueDate).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  issueDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                });
              }}
            />
            <Box display="flex" flexDirection="column" gap={1}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Vordering:</Typography>
                    <Typography>{formatUSD(subtotal)}</Typography>
                  </Box>
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
                disabled={loading}
                loading={loading}
              >
                SAVE
              </Button>
            </Stack>
          </Box>
        </form>
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
