"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DebtorCreateSchema, DebtorCreate } from "@/lib/validations/debtor";

import {
  Button,
  Box,
  Stack,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import InputHookForm from "@/components/ui/InputHookForm";
import SelectHookForm from "@/components/ui/SelectHookForm";
import { personTypeOptions } from "@/common/data/identificationTypes";
import {
  createDebtor,
  getDebtorById,
  updateDebtor,
} from "@/app/actions/debtor";
import { useTenant } from "@/hooks/useTenant";
import { notifyError, notifySuccess } from "@/lib/notifications";
import CloseIcon from "@mui/icons-material/Close";
import { $Enums } from "@/prisma/generated/prisma";

interface ModalFormDebtorProps {
  open: boolean;
  onClose: () => void;
  onSave: (debtor: any) => void;
  id?: string;
}

const identificationTypeOptions = [
  { value: $Enums.IdentificationType.DNI, label: "DNI" },
  { value: $Enums.IdentificationType.PASSPORT, label: "PASPOORT" },
  { value: $Enums.IdentificationType.NIE, label: "NIE" },
  { value: $Enums.IdentificationType.OTHER, label: "OTHER " },
];

export const ModalFormDebtor: React.FC<ModalFormDebtorProps> = ({
  open,
  onClose,
  onSave,
  id,
}) => {
  const { tenant } = useTenant();

  const [loading, setLoading] = useState(false);

  const methods = useForm<DebtorCreate>({
    resolver: zodResolver(
      DebtorCreateSchema
    ) as unknown as Resolver<DebtorCreate>,
    defaultValues: {
      email: "",
      fullname: "",
      address: "",
      phone: "",
      person_type: $Enums.PersonType.INDIVIDUAL,
      identification_type: $Enums.IdentificationType.DNI,
      identification: "",
      total_income: 0,
      incomes: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const fetchDebtor = async () => {
    if (!id) {
      throw new Error("ID is required");
    }

    const debtor = await getDebtorById(id);

    if (!debtor) {
      throw new Error("Debtor not found");
    }

    reset({
      fullname: debtor.fullname,
      email: debtor.email,
      phone: debtor.phone || "",
      address: debtor.address || "",
      identification: debtor.identification,
      identification_type: debtor.identification_type,
      person_type:
        debtor.person_type === "INDIVIDUAL" || debtor.person_type === "COMPANY"
          ? debtor.person_type
          : "INDIVIDUAL",
    });
  };

  useEffect(() => {
    if (id && open) {
      try {
        setLoading(true);

        fetchDebtor();
      } catch (error) {
        console.error("Error fetching debtor:", error);
        reset();
      } finally {
        setLoading(false);
      }
    } else if (open) {
      handleClearForm();
    }
  }, [id, open]);

  const handleClearForm = () => {
    reset({
      fullname: "",
      email: "",
      phone: "",
      address: "",
      identification: "",
      identification_type: "DNI",
      person_type: "INDIVIDUAL",
    });
  };

  const onSubmit = async (values: DebtorCreate) => {
    if (!tenant) return;

    try {
      console.log("Submitting debtor:", values);

      if (id) {
        const updDebtor = await updateDebtor(values, tenant.id, id);
        onSave(updDebtor);
      } else {
        const newDebtor = await createDebtor(values, tenant.id);
        if (newDebtor) {
          onSave(newDebtor);
        }
      }

      notifySuccess(`Debtor ${id ? "updated" : "created"} successfully`);
      reset();
      onClose();
    } catch (error) {
      console.error("Error creating debtor:", error);
      notifyError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Paper
        component="section"
        sx={{
          mt: 2,
          elevation: 1,
          borderRadius: 1,
          overflow: "hidden",
          mb: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
        }}
      >
        <Box
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {"DEBITEUR"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} id="debtor-form">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <SelectHookForm
                  name="person_type"
                  label="Person Type"
                  options={personTypeOptions}
                  required={true}
                />
                <SelectHookForm
                  name="identification_type"
                  label="Identification Type"
                  options={identificationTypeOptions}
                />
                <InputHookForm
                  name="identification"
                  label="Identification"
                  required={true}
                />
                <InputHookForm
                  name="fullname"
                  label="Full Name"
                  required={true}
                />
                <InputHookForm name="email" label="Email" required={true} />
                <InputHookForm name="phone" label="Phone" required={true} />
                <InputHookForm name="address" label="Address" required={true} />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button onClick={onClose} color="secondary" fullWidth>
                    ANNULEREN
                  </Button>
                  <Button
                    type="submit"
                    form="debtor-form"
                    color="primary"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                  >
                    {id ? "UPDATE" : "SAVE"}
                  </Button>
                </Stack>
              </Box>
            </form>
          </FormProvider>
        </Box>
      </Paper>
    </Modal>
  );
};
