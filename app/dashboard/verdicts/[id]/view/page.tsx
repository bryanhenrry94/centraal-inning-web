"use client";
import React, { useEffect } from "react";
import { VerdictProvider } from "@/contexts/verdictContext";
import ActionToolbar from "@/components/ui/breadcrums";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
// icons
import CalculateIcon from "@mui/icons-material/Calculate";
import SellIcon from "@mui/icons-material/Sell";

import { VerdictResponse } from "@/lib/validations/verdict";
import {
  approveVerdict,
  getVerdictById,
  handleSendMailNotificationCreditor,
  handleSendMailNotificationDebtor,
} from "@/app/actions/verdict";
import { VerdictEmbargo } from "@/lib/validations/verdict-embargo";
import { IVerdictInterest } from "@/lib/validations/verdict-interest";
import { InterestType } from "@/lib/validations/interest-type";

import { formatCurrency, formatDate } from "@/common/utils/general";
import { getAllInterestTypes } from "@/app/actions/interest-type";
import { Catalogo, embargoTipos } from "@/common/data";
import { AlertService } from "@/lib/alerts";
import { notifyInfo } from "@/lib/notifications";
import { useRouter } from "next/navigation";

const CustomInterestRow: React.FC<{
  item: IVerdictInterest;
  interests: InterestType[];
}> = ({ item, interests }) => {
  return (
    <TableRow key={item.id}>
      {/* interestType */}
      <TableCell sx={{ textAlign: "center" }}>
        {interests.find((i) => i.id === item.interestType)?.name ?? ""}
      </TableCell>
      {/* calculationStart */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatDate(item.calculationStart.toString())}
      </TableCell>
      {/* calculationEnd */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatDate(item.calculationEnd.toString())}
      </TableCell>
      {/* baseAmount */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatCurrency(item.baseAmount || 0)}
      </TableCell>
      {/* totalInterest */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatCurrency(item.totalInterest || 0)}
      </TableCell>
      {/* total */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatCurrency(
          Number(item.baseAmount) + Number(item.totalInterest) || 0
        )}
      </TableCell>
      {/* calculatedInterest */}
      <TableCell sx={{ textAlign: "center" }}>
        {item.calculatedInterest
          ? formatCurrency(item.calculatedInterest || 0)
          : "-"}
      </TableCell>
    </TableRow>
  );
};

const CustomEmbargoRow: React.FC<{
  item: VerdictEmbargo;
  embargoTypes: Catalogo[];
}> = ({ item, embargoTypes }) => {
  return (
    <TableRow key={item.id}>
      {/* companyName */}
      <TableCell sx={{ textAlign: "center" }}>{item.companyName}</TableCell>
      {/* companyPhone */}
      <TableCell sx={{ textAlign: "center" }}>{item.companyPhone}</TableCell>
      {/* companyEmail */}
      <TableCell sx={{ textAlign: "center" }}>{item.companyEmail}</TableCell>
      {/* companyAddress */}
      <TableCell sx={{ textAlign: "center" }}>{item.companyAddress}</TableCell>
      {/* embargoType */}
      <TableCell sx={{ textAlign: "center" }}>
        {embargoTypes.find((i) => i.id === item.embargoType)?.nombre ?? ""}
      </TableCell>
      {/* embargoDate */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatDate(item.embargoDate.toString())}
      </TableCell>
      {/* embargoAmount */}
      <TableCell sx={{ textAlign: "center" }}>
        {formatCurrency(item.embargoAmount || 0)}
      </TableCell>
    </TableRow>
  );
};

const VerdictPageView: React.FC = () => {
  const params = useParams();
  const id = (params.id as string) || "";
  const [verdict, setVerdict] = React.useState<VerdictResponse | null>(null);
  const [totalInterest, setTotalInterest] = React.useState<number>(0);
  const [procesalCost, setProcesalCost] = React.useState<number>(0);
  const [interesTipos, setInteresTipos] = React.useState<InterestType[]>([]);
  const router = useRouter();

  const [total, setTotal] = React.useState<number>(0);

  useEffect(() => {
    if (!id) {
      console.error("ID is required to view a verdict.");
      return;
    }
  }, [id]);

  useEffect(() => {
    // Fetch interest types from the service
    const fetchInterestTypes = async () => {
      const response = await getAllInterestTypes();
      setInteresTipos(response.interestTypes);
    };

    fetchInterestTypes();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchVerdict = async () => {
        const verdict = await getVerdictById(id);
        if (verdict) {
          setVerdict(verdict);

          const _totalInterest = verdict?.verdictInterest.reduce(
            (acc, curr) => acc + (curr.totalInterest || 0),
            0
          );

          const _procesalCost = verdict?.procesalCost || 0;

          // Calcula totales
          setTotalInterest(_totalInterest);
          setProcesalCost(_procesalCost);
          setTotal(verdict.sentenceAmount + _totalInterest + _procesalCost);
        }
      };
      fetchVerdict();
    }
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;

    AlertService.showConfirm(
      "¿Estás seguro?",
      "Se procederá a aprobar el vonnis y se notificará al deudor.",
      "Sí, aprobar",
      "Cancelar"
    ).then(async (confirmed) => {
      if (confirmed) {
        await approveVerdict(id);
        notifyInfo("Vonnis aprobado exitosamente");

        await handleSendMailNotificationDebtor(id);
        notifyInfo("Notificación enviada al deudor");

        await handleSendMailNotificationCreditor(id);
        notifyInfo("Notificación enviada al acreedor");

        router.push(`/verdicts`);
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ActionToolbar
        title="Consultar"
        navigation={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Vonnis", href: "/dashboard/verdicts" },
        ]}
      />
      <Box sx={{ mt: 2 }}>
        <VerdictProvider>
          <Box component={"div"}>
            {/* Header Section */}
            <Box display={"flex"} justifyContent="space-between" mb={2}>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ textAlign: "left" }}
                >
                  CONSULTA DE VONNIS
                </Typography>
                <Typography variant="subtitle2">
                  Consulta los detalles del vonnis.
                </Typography>
              </Box>
              {verdict?.status === "APPROVED" ? (
                <Chip color="success" label="Vonnis aprobado" />
              ) : (
                <Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      color="primary"
                      aria-label="add an alarm"
                      variant="contained"
                      sx={{ textTransform: "none" }}
                      onClick={handleApprove}
                    >
                      Aprobar Vonnis
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Vonnis Information Section */}
            <Paper
              component="section"
              sx={{ mt: 2, elevation: 1, borderRadius: 1, overflow: "hidden" }}
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
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 600 }}
                >
                  Información del Vonnis
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Número de Factura
                      </Typography>
                      <Typography variant="body1">
                        {verdict?.invoiceNumber ?? ""}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8, md: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Nombre del acreedor
                      </Typography>
                      <Typography variant="body1">
                        {verdict?.creditorName ?? ""}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8, md: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Nombre del deudor
                      </Typography>
                      <Typography variant="body1">
                        {verdict?.debtor.fullname ?? ""}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Número de registro
                      </Typography>
                      <Typography variant="body1">
                        {verdict?.registrationNumber ?? ""}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Monto Sentencia
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(verdict?.sentenceAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Fecha Sentencia
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(
                          verdict?.sentenceDate
                            ? verdict.sentenceDate.toString()
                            : ""
                        )}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Costo Procesal
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(procesalCost)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>

            {/* Calculo de Interés Section */}
            <Paper
              component="section"
              sx={{ mt: 2, elevation: 1, borderRadius: 1, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CalculateIcon />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 600 }}
                >
                  Cálculo de interés
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
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
                            minWidth: 150,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Tipo de interés
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Fecha Inicio
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Fecha Fin
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 100,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Monto a Aplicar
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 100,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Interés Total
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Total
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Interés
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {verdict?.verdictInterest.length === 0 && (
                        <TableRow key="no-interest-row">
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body2" color="textSecondary">
                              No hay registros de interés.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {verdict?.verdictInterest.map((item, index) => {
                        const field = item as IVerdictInterest;

                        return (
                          <CustomInterestRow
                            key={field.id ?? index}
                            item={field}
                            interests={interesTipos}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            {/* Interest de embargo */}
            <Paper
              component="section"
              sx={{ mt: 2, elevation: 1, borderRadius: 1, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SellIcon />
                <Typography variant="h6" component="h3">
                  Información de embargo
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
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
                            minWidth: 150,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Ejecutador
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 120,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Empresa
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 120,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Teléfono
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 120,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Correo
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 150,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Dirección
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 100,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Tipo de embargo
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 100,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Fecha de embargo
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          1/3 Deudor
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Costo Alguacil
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 75,
                            backgroundColor: "secondary.main",
                            color: "#fff",
                            fontWeight: "bold",
                            border: "1px solid #bdbdbd",
                          }}
                          align="center"
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {verdict?.verdictEmbargo.length === 0 && (
                        <TableRow key="no-interest-row">
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body2" color="textSecondary">
                              No hay registros de embargo.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {verdict?.verdictEmbargo.map((item, index) => {
                        const field = item as VerdictEmbargo;

                        return (
                          <CustomEmbargoRow
                            key={field.id ?? index}
                            item={field}
                            embargoTypes={embargoTipos}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            {/* Resumen de Totales */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "right" }}>
              <Card
                sx={{
                  mt: 2,
                  borderRadius: 1,
                  maxWidth: 400,
                  minWidth: 300,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overzicht
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gridColumn: "span 2",
                      }}
                    >
                      <Typography>Monto Sentencia:</Typography>
                      <Typography fontWeight="600">
                        {formatCurrency(verdict?.sentenceAmount || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gridColumn: "span 2",
                      }}
                    >
                      <Typography>Total Interés:</Typography>
                      <Typography fontWeight="600">
                        {formatCurrency(totalInterest)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gridColumn: "span 2",
                      }}
                    >
                      <Typography>Costo Procesal:</Typography>
                      <Typography fontWeight="600">
                        {formatCurrency(procesalCost)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        gridColumn: "span 2",
                        borderTop: 1,
                        borderColor: "divider",
                        pt: 2,
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                        }}
                      >
                        <Typography variant="h6">Total Final:</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(total)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </VerdictProvider>
      </Box>
    </Container>
  );
};

export default VerdictPageView;
