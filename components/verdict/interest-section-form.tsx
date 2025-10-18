import React, { useEffect } from "react";
// mui
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
// react-hook-form
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
// icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
// schemas
import { VerdictInterestDetailCreate } from "@/lib/validations/verdict-interest-details";
import { InterestType } from "@/lib/validations/interest-type";
import {
  IVerdictInterest,
  IVerdictInterestCreate,
} from "@/lib/validations/verdict-interest";
// actions
import { getAllInterestTypes } from "@/app/actions/interest-type";
// components
import InterestCell from "@/components/verdict/interest-cell";
import TotalCell from "@/components/verdict/total-cell";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 1000,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 1,
  p: 2,
};

interface InteresSectionProps {}

const InteresSection: React.FC<InteresSectionProps> = () => {
  const [interesTipos, setInteresTipos] = React.useState<InterestType[]>([]);
  const [rowsInterest, setRowsInterest] = React.useState<
    VerdictInterestDetailCreate[]
  >([]);

  const [open, setOpen] = React.useState<boolean>(false);
  const handleClose = () => setOpen(false);

  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<{
    verdictInterest: IVerdictInterestCreate[];
    totalInterest?: number;
  }>();

  const { fields, append, remove } = useFieldArray<{
    verdictInterest: IVerdictInterestCreate[];
  }>({
    control,
    name: "verdictInterest",
  });

  useEffect(() => {
    // Fetch interest types from the service
    const fetchInterestTypes = async () => {
      const response = await getAllInterestTypes();
      setInteresTipos(response.interestTypes);
    };

    fetchInterestTypes();
  }, []);

  const handleShowDetail = (item: IVerdictInterestCreate) => {
    setOpen(true);
    setRowsInterest(item.details);
  };

  const CalculatedInterestCell = ({
    control,
    index,
  }: {
    control: any;
    index: number;
  }) => {
    const item = useWatch({
      control,
      name: `verdictInterest.${index}`,
    });

    return (
      <>
        {interesTipos.find((tipo) => tipo.id === Number(item.interestType))
          ?.calculationType === "FIXED" ? (
          <Controller
            name={`verdictInterest.${index}.calculatedInterest`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                type="number"
                placeholder="0.00"
                inputProps={{ step: "any" }}
                error={!!errors.verdictInterest?.[index]?.calculatedInterest}
                helperText={
                  errors.verdictInterest?.[index]?.calculatedInterest?.message
                }
              />
            )}
          />
        ) : (
          <IconButton
            aria-label="edit"
            color="secondary"
            size="small"
            onClick={() => {
              handleShowDetail(item);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        )}
      </>
    );
  };

  const CreateCustomRow: React.FC<{
    item: IVerdictInterest;
    index: number;
  }> = ({ item, index }) => {
    return (
      <TableRow key={item.id}>
        {/* interestType */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictInterest.${index}.interestType`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="outlined-select-interestType"
                select
                value={field.value ?? ""}
                fullWidth
                size="small"
                error={!!errors.verdictInterest?.[index]?.interestType}
                helperText={
                  errors.verdictInterest?.[index]?.interestType?.message
                }
              >
                {interesTipos.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </TableCell>

        {/* calculationStart */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictInterest.${index}.calculationStart`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.verdictInterest?.[index]?.calculationStart}
                helperText={
                  errors.verdictInterest?.[index]?.calculationStart?.message
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
        {/* calculationEnd */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictInterest.${index}.calculationEnd`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.verdictInterest?.[index]?.calculationEnd}
                helperText={
                  errors.verdictInterest?.[index]?.calculationEnd?.message
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
        {/* baseAmount */}
        <TableCell sx={{ textAlign: "center" }}>
          <Controller
            name={`verdictInterest.${index}.baseAmount`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                type="number"
                placeholder="0.00"
                inputProps={{ step: "any" }}
                error={!!errors.verdictInterest?.[index]?.baseAmount}
                helperText={
                  errors.verdictInterest?.[index]?.baseAmount?.message
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

        {/* totalInterest */}
        <TableCell sx={{ textAlign: "center" }}>
          <InterestCell control={control} index={index} />
        </TableCell>
        {/* total */}
        <TableCell sx={{ textAlign: "center" }}>
          <TotalCell control={control} index={index} />
        </TableCell>
        {/* calculatedInterest */}
        {/* <TableCell sx={{ textAlign: "center" }}>
          <CalculatedInterestCell control={control} index={index} />
        </TableCell> */}
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
    <Box>
      <TableContainer
        component={Paper}
        sx={{ width: "100%", boxShadow: "none" }}
      >
        <Table
          stickyHeader
          sx={{
            width: "100%",
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
                  minWidth: 150,
                  backgroundColor: "#f5f5f5",

                  border: "1px solid #bdbdbd",
                }}
                align="left"
              >
                Soort rente
              </TableCell>

              <TableCell
                sx={{
                  minWidth: 75,
                  backgroundColor: "#f5f5f5",

                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Berekenen vanaf
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 75,
                  backgroundColor: "#f5f5f5",

                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Berekenen tot en met
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 100,
                  backgroundColor: "#f5f5f5",

                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Hoofdsom
              </TableCell>

              <TableCell
                sx={{
                  minWidth: 100,
                  backgroundColor: "#f5f5f5",

                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Rente
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
              {/* <TableCell
                sx={{
                  minWidth: 75,
                  backgroundColor: "#f5f5f5",
                  
                  
                  border: "1px solid #bdbdbd",
                }}
                align="center"
              >
                Interés
              </TableCell> */}
              <TableCell
                sx={{
                  minWidth: 50,
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
              const field = item as IVerdictInterest;

              return (
                <CreateCustomRow key={field.id} item={field} index={index} />
              );
            })}

            <TableRow>
              <TableCell colSpan={8} align="left">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() =>
                    append({
                      interestType: 1,
                      baseAmount: 0,
                      calculatedInterest: 0,
                      calculationStart: new Date(),
                      calculationEnd: new Date(),
                      totalInterest: 0,
                      details: [],
                    })
                  }
                  sx={{ textTransform: "none" }}
                >
                  Nieuwe renteberekening toevoegen
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* <FormHelperText sx={{ color: "error.main" }}>
        {Object.keys(errors).length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {Object.entries(errors).map(([key, value]) => {
              const renderMessages = (
                val: any,
                path: string[] = []
              ): React.ReactNode => {
                if (val?.message) {
                  return (
                    <li key={path.join(".")}>
                      {`${path.join(".")}: ${val.message}`}
                    </li>
                  );
                }
                if (typeof val === "object" && val !== null) {
                  return Object.entries(val).map(([k, v]) =>
                    renderMessages(v, [...path, k])
                  );
                }
                return null;
              };
              return renderMessages(value, [key]);
            })}
          </ul>
        )}
      </FormHelperText> */}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, maxHeight: "90vh", overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "secondary.light",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: "#f5f5f5" }}
            >
              Detalle de Interés
            </Typography>
            <IconButton
              onClick={handleClose}
              color="primary"
              sx={{
                backgroundColor: "#f5f5f5",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table
              stickyHeader
              sx={{ minWidth: 900, bgcolor: "white" }}
              aria-label="tabla de calculatedInterest"
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      minWidth: 50,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Tramo
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Fecha Ini.
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Fecha Fin
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 50,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Dias
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Tasa Anual
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Proporcional
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Monto
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 75,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Interes
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 100,
                      backgroundColor: "#f5f5f5",

                      border: "1px solid #bdbdbd",
                    }}
                    align="center"
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsInterest.map((row) => (
                  <TableRow
                    key={row.period}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell align="center" component="th" scope="row">
                      {row.period}
                    </TableCell>
                    <TableCell align="center">
                      {row.periodStart.toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell align="center">
                      {row.periodEnd.toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell align="center">{row.days}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={Number(row.annualRate).toFixed(2)}
                        size="small"
                        fullWidth
                        disabled // Deshabilitado para evitar edición accidental
                        inputProps={{ step: "any" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {Number(row.proportionalRate).toFixed(8)}
                    </TableCell>
                    <TableCell align="center" sx={{ textAlign: "right" }}>
                      {`$ ${Number(row.baseAmount).toFixed(2)}`}
                    </TableCell>
                    <TableCell align="center" sx={{ textAlign: "right" }}>
                      {`$ ${Number(row.interest).toFixed(2)}`}
                    </TableCell>
                    <TableCell align="center" sx={{ textAlign: "right" }}>
                      {`$ ${Number(row.total).toFixed(2)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" color="primary" onClick={handleClose}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default InteresSection;
