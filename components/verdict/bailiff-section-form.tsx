"use client";
import { useEffect, useState } from "react";
// mui
import {
  Autocomplete,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Grid,
} from "@mui/material";
// icons
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
// react-hook-form
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
// validations
import { Verdict } from "@/lib/validations/verdict";
import { VerdictBailiffServices } from "@/lib/validations/verdict-bailiff-services";
import { User } from "@/lib/validations/user";
// actions and libs
import { getUsersByRole } from "@/app/actions/user";
import { AlertService } from "@/lib/alerts";

interface BailiffSectionProps {}

const BailiffSection: React.FC<BailiffSectionProps> = () => {
  const [bailiffs, setBailiffs] = useState<User[]>([]);

  const {
    control,
    formState: { errors },
  } = useFormContext<Verdict>();

  const { fields, append, remove } = useFieldArray<{
    bailiff_services: VerdictBailiffServices[];
  }>({
    // control,
    name: "bailiff_services",
  });

  useEffect(() => {
    const fetchBailiffs = async () => {
      // Fetch bailiffs from the API or any other source
      const data = await getUsersByRole("BAILIFF");

      if (data) {
        setBailiffs(data);
      } else {
        setBailiffs([]);
      }
    };

    fetchBailiffs();
  }, []);

  const handleDelete = (index: number) => {
    AlertService.showConfirm(
      "Weet je het zeker?",
      "Weet u zeker dat u wilt verwijderen?",
      "Ja, verwijderen",
      "Annuleren"
    ).then(async (confirmed) => {
      if (confirmed) {
        remove(index);
      }
    });
  };

  const CreateCustomRow: React.FC<{
    item: VerdictBailiffServices;
    index: number;
  }> = ({ item, index }) => {
    return (
      <TableRow key={item.id}>
        {/* service_type */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`bailiff_services.${index}.service_type`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                type="text"
                placeholder="Voorbeeld: Betekening Vonnis"
                error={!!errors.bailiff_services?.[index]?.service_type}
                helperText={
                  errors.bailiff_services?.[index]?.service_type?.message
                }
              />
            )}
          />
        </TableCell>
        {/* company_phone */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`bailiff_services.${index}.service_cost`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                size="small"
                placeholder="Ej: $45.00"
                error={!!errors.bailiff_services?.[index]?.service_cost}
                helperText={
                  errors.bailiff_services?.[index]?.service_cost?.message
                }
              />
            )}
          />
        </TableCell>
        {/* action */}
        <TableCell sx={{ textAlign: "center" }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              aria-label="delete"
              color="error"
              size="small"
              onClick={() => handleDelete(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
        <Grid size={{ xs: 6, sm: 4, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Controller
              name="bailiff_id"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Autocomplete
                  options={bailiffs}
                  getOptionLabel={(option) => option?.fullname ?? ""}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={
                    bailiffs.find((bailiff) => bailiff.id === value) || null
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
                      inputRef={ref}
                      size="small"
                      label="Selecteer een Deurwaarder"
                      fullWidth
                      error={!!errors.bailiff_id}
                      helperText={errors.bailiff_id?.message}
                    />
                  )}
                />
              )}
            />
            <IconButton aria-label="toggle password visibility" edge="end">
              {/* <FaUserEdit onClick={onOpenModalDebtor} /> */}
              <PersonAddIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table
          stickyHeader
          sx={{
            width: { xs: "100%", md: "100%" },
            "& .MuiTableCell-root": {
              border: "1px solid #e0e0e0",
            },
          }}
          aria-label="tabla de embargo"
          size="small"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: { xs: 200, md: 500 },
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #bdbdbd",
                }}
                align="left"
              >
                Betekening Vonnis
              </TableCell>
              <TableCell
                sx={{
                  width: { xs: 200, md: 200 },
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Kosten
              </TableCell>
              <TableCell
                sx={{
                  width: 75,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Acties
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((item, index) => (
              <CreateCustomRow
                key={item.id}
                item={item as VerdictBailiffServices}
                index={index}
              />
            ))}

            <TableRow>
              <TableCell colSpan={11} align="left">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() =>
                    append({
                      id: Date.now().toString(),
                      verdict_id: "",
                      service_type: "",
                      service_cost: 0,
                      created_at: new Date(),
                      updated_at: new Date(),
                    })
                  }
                  sx={{ textTransform: "none" }}
                >
                  Nieuwe dienst toevoegen
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BailiffSection;
