"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DebtorCreateSchema, DebtorCreate } from "@/lib/validations/debtor";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
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

interface ModalFormDebtorProps {
  open: boolean;
  onClose: () => void;
  onSave: (debtor: any) => void;
  id?: string;
}

const identificationTypeOptions = [
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "Passport" },
  { value: "NIE", label: "NIE" },
  { value: "OTHER", label: "Other" },
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
    // resolver: zodResolver(DebtorCreateSchema),
    // defaultValues: {
    //   fullname: "",
    //   email: "",
    //   phone: "",
    //   address: "",
    //   identification: "",
    //   identificationType: "DNI",
    //   personType: "individual",
    // },
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
      identificationType: debtor.identificationType,
      personType:
        debtor.personType === "individual" || debtor.personType === "company"
          ? debtor.personType
          : "individual",
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
      identificationType: "DNI",
      personType: "individual",
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{id ? "Edit Debtor" : "Create Debtor"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Grid>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} id="debtor-form">
              <Grid container spacing={2} mt={0.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <SelectHookForm
                    name="personType"
                    label="Person Type"
                    options={personTypeOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <SelectHookForm
                    name="identificationType"
                    label="Identification Type"
                    options={identificationTypeOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <InputHookForm name="identification" label="Identification" />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <InputHookForm name="fullname" label="Full Name" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <InputHookForm name="email" label="Email" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <InputHookForm name="phone" label="Phone" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <InputHookForm name="address" label="Address" />
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          form="debtor-form"
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {id ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
