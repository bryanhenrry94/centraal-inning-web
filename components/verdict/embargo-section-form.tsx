"use client";
import { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import { embargoTipos } from "@/common/data";
import { VerdictEmbargo } from "@/lib/validations/verdict-embargo";
import { User } from "@/lib/validations/user";
import { getUsersByRole } from "@/app/actions/user";

const TotalCell = ({ control, index }: { control: any; index: number }) => {
  const { setValue } = useFormContext();

  const item = useWatch({
    control,
    name: `verdictEmbargo.${index}`,
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const total =
      Number(item.embargoAmount ?? 0) + Number(item.bailiffAmount ?? 0);

    setTotal(total);
    setValue(`verdictEmbargo.${index}.totalAmount`, total);
  }, [item.embargoAmount, item.bailiffAmount]);

  return (
    <TextField
      value={total.toFixed(2)}
      size="small"
      InputProps={{
        readOnly: true,
      }}
      disabled
    />
  );
};

interface EmbargoSectionProps {}

const EmbargoSection: React.FC<EmbargoSectionProps> = () => {
  const [bailiffs, setBailiffs] = useState<User[]>([]);

  const {
    control,
    formState: { errors },
  } = useFormContext<{
    verdictEmbargo: VerdictEmbargo[];
  }>();

  const { fields, append, remove } = useFieldArray<{
    verdictEmbargo: VerdictEmbargo[];
  }>({
    control,
    name: "verdictEmbargo",
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

  const CreateCustomRow: React.FC<{
    item: VerdictEmbargo;
    index: number;
  }> = ({ item, index }) => {
    return (
      <TableRow key={item.id}>
        {/* companyName */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.companyName`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                type="text"
                placeholder="Ej: Urbano Company"
                error={!!errors.verdictEmbargo?.[index]?.companyName}
                helperText={
                  errors.verdictEmbargo?.[index]?.companyName?.message
                }
              />
            )}
          />
        </TableCell>
        {/* companyPhone */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.companyPhone`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                fullWidth
                size="small"
                placeholder="Ej: 123456789"
                error={!!errors.verdictEmbargo?.[index]?.companyPhone}
                helperText={
                  errors.verdictEmbargo?.[index]?.companyPhone?.message
                }
              />
            )}
          />
        </TableCell>
        {/* companyEmail */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.companyEmail`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                fullWidth
                size="small"
                placeholder="Ej: pepito@example.com"
                error={!!errors.verdictEmbargo?.[index]?.companyEmail}
                helperText={
                  errors.verdictEmbargo?.[index]?.companyEmail?.message
                }
              />
            )}
          />
        </TableCell>
        {/* companyAddress */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.companyAddress`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                fullWidth
                size="small"
                placeholder="Ej: Calle Falsa 123"
                error={!!errors.verdictEmbargo?.[index]?.companyAddress}
                helperText={
                  errors.verdictEmbargo?.[index]?.companyAddress?.message
                }
              />
            )}
          />
        </TableCell>
        {/* embargoType */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.embargoType`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="outlined-select-embargoType"
                select
                value={field.value ?? ""}
                fullWidth
                size="small"
                error={!!errors.verdictEmbargo?.[index]?.embargoType}
                helperText={
                  errors.verdictEmbargo?.[index]?.embargoType?.message
                }
              >
                {embargoTipos.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </TableCell>
        {/* embargoDate */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.embargoDate`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.verdictEmbargo?.[index]?.embargoDate}
                helperText={
                  errors.verdictEmbargo?.[index]?.embargoDate?.message
                }
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
          />
        </TableCell>
        {/* embargoAmount */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictEmbargo.${index}.embargoAmount`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                type="number"
                placeholder="0.00"
                inputProps={{ step: "any" }}
                error={!!errors.verdictEmbargo?.[index]?.embargoAmount}
                helperText={
                  errors.verdictEmbargo?.[index]?.embargoAmount?.message
                }
                value={field.value ?? ""} // si es null/undefined → ""
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? null : parseFloat(val));
                }}
              />
            )}
          />
        </TableCell>
        {/* totalAmount */}
        <TableCell sx={{ textAlign: "center" }}>
          <TotalCell control={control} index={index} />
        </TableCell>
        {/* action */}
        <TableCell sx={{ textAlign: "center" }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              aria-label="delete"
              color="error"
              size="small"
              onClick={() => remove(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table
        stickyHeader
        sx={{
          minWidth: 900,
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
                minWidth: 120,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="left"
            >
              Beslaglocatie
            </TableCell>
            <TableCell
              sx={{
                minWidth: 120,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Telefoon
            </TableCell>
            <TableCell
              sx={{
                minWidth: 120,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Mail
            </TableCell>
            <TableCell
              sx={{
                minWidth: 150,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Adres
            </TableCell>
            <TableCell
              sx={{
                minWidth: 100,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Soort Beslag
            </TableCell>
            <TableCell
              sx={{
                minWidth: 100,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Datum Beslag
            </TableCell>
            <TableCell
              sx={{
                minWidth: 100,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              1/3 Schuldenaar
            </TableCell>
            <TableCell
              sx={{
                minWidth: 75,
                backgroundColor: "#f5f5f5",

                border: "1px solid #bdbdbd",
              }}
              align="center"
            >
              Totaal
            </TableCell>
            <TableCell
              sx={{
                minWidth: 75,
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
          {fields.map((item, index) => {
            const field = item as VerdictEmbargo;

            return (
              <CreateCustomRow key={field.id} item={field} index={index} />
            );
          })}
          <TableRow>
            <TableCell colSpan={11} align="left">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() =>
                  append({
                    id: Date.now().toString(),
                    verdictId: "",
                    companyName: "",
                    companyPhone: "",
                    companyEmail: "",
                    companyAddress: "",
                    embargoType: "",
                    embargoDate: new Date(),
                    embargoAmount: 0,
                    totalAmount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })
                }
                sx={{ textTransform: "none" }}
              >
                Nieuwe Beslag Toevoegen
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EmbargoSection;
