"use client";
import React, { Suspense, useEffect, useState } from "react";
import { getAllCollectionCasesByUserId } from "@/app/actions/collection";
import { CollectionCaseResponse } from "@/lib/validations/collection";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Modal,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HandshakeIcon from "@mui/icons-material/Handshake";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useSession } from "next-auth/react";
import { formatCurrency, formatDate } from "@/common/utils/general";
import CollectionStatusChip from "@/components/ui/collection-status-chip";
import AgreementTable from "@/components/agreements/agreement-table";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
  PaymentAgreementResponse,
} from "@/lib/validations/payment-agreement";
import {
  createPaymentAgreement,
  existsPaymentAgreement,
  getPaymentAgreements,
  updatePaymentAgreement,
} from "@/app/actions/payment-agreement";
import { notifyError, notifyInfo } from "@/lib/notifications";
import TabPanel from "@/components/ui/tab-panel";
import AgreementForm from "@/components/agreements/agreement-form";
import { getDebtorByUserId } from "@/app/actions/debtor";
import { $Enums } from "@/prisma/generated/prisma";

const DashboardDebtor = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // State variables
  const [loading, setLoading] = useState(false);
  const [value, setValue] = React.useState(0);
  const [paymentAgreements, setPaymentAgreements] = useState<
    PaymentAgreementResponse[]
  >([]);
  const [collectionCaseSelected, setCollectionCaseSelected] =
    useState<CollectionCaseResponse | null>(null);
  const [collectionCases, setCollectionCases] = useState<
    CollectionCaseResponse[]
  >([]);
  const [openModalAgreement, setOpenModalAgreement] = React.useState(false);

  useEffect(() => {
    fetchCollectionCases();
    fetchPaymentAgreements();
  }, []);

  const handleOpenModalAgreement = () => setOpenModalAgreement(true);
  const handleCloseModalAgreement = () => setOpenModalAgreement(false);

  const fetchCollectionCases = async () => {
    try {
      const data = await getAllCollectionCasesByUserId(
        user?.tenant_id as string,
        user?.id as string
      );
      setCollectionCases(data);
    } catch (error) {
      console.error("Error fetching collection cases:", error);
    }
  };

  const fetchPaymentAgreements = async () => {
    try {
      setLoading(true);

      const debtor = await getDebtorByUserId(user?.id as string);
      if (!debtor) {
        notifyError("No se encontró el deudor asociado al usuario");
        return;
      }

      const data = await getPaymentAgreements({ debtor_id: debtor.id });
      if (data) {
        setPaymentAgreements(data);
      }
    } catch (error) {
      console.error("Error fetching payment agreements:", error);
      notifyError("Error al cargar los acuerdos de pago");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAgreement = () => {
    if (!collectionCaseSelected) return;
    fetchPaymentAgreements();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAgreementSubmit = async (data: Partial<PaymentAgreement>) => {
    // Implement submission logic here
    try {
      setLoading(true);
      console.log("Agreement Data Submitted:", data);

      if (!collectionCaseSelected?.id) return;

      if (!session?.user?.tenant_id) {
        notifyError("No se encontró el tenant_id del usuario");
        return;
      }

      const agreementCreate: PaymentAgreementCreate = {
        collection_case_id: collectionCaseSelected.id,
        total_amount: Number(data.total_amount),
        installments_count: Number(data.installments_count),
        installment_amount: Number(data.installment_amount),
        start_date: data.start_date || new Date(),
        end_date: data.end_date || new Date(),
        status: data.status || "ACTIVE",
      };

      if (agreementCreate.start_date < new Date()) {
        notifyError("La fecha de inicio debe ser mayor a la fecha actual");
        return;
      }

      const exists = await existsPaymentAgreement(collectionCaseSelected?.id);
      if (exists) {
        notifyError("Ya existe un acuerdo de pago para esta collection");
        return;
      }

      const debtor = await getDebtorByUserId(user?.id as string);
      if (!debtor) {
        notifyError("No se encontró el deudor asociado al usuario");
        return;
      }

      agreementCreate.debtor_id = debtor.id;

      await createPaymentAgreement(session?.user?.tenant_id, agreementCreate);
      await fetchPaymentAgreements();
      handleCloseModalAgreement();
      notifyInfo("Payment agreement submitted successfully");
    } catch (error) {
      console.error("Error creating payment agreement:", error);
      notifyError("Error al crear el acuerdo de pago");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (data: Partial<PaymentAgreement>) => {
    try {
      setLoading(true);
      if (!data.id) {
        notifyError("Agreement ID is required");
        return;
      }
      await updatePaymentAgreement(data.id, {
        ...data,
        status: $Enums.AgreementStatus.ACCEPTED,
      });
      notifyInfo("Payment agreement approved successfully");
      fetchPaymentAgreements();
    } catch (error) {
      console.error("Error approving payment agreement:", error);
      notifyError("Error al aprobar el acuerdo de pago");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (data: Partial<PaymentAgreement>) => {
    try {
      setLoading(true);
      if (!data.id) {
        notifyError("Agreement ID is required");
        return;
      }
      await updatePaymentAgreement(data.id, {
        ...data,
        status: $Enums.AgreementStatus.REJECTED,
      });
      notifyInfo("Payment agreement rejected successfully");
      fetchPaymentAgreements();
    } catch (error) {
      console.error("Error rejecting payment agreement:", error);
      notifyError("Error al rechazar el acuerdo de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Mijn schulden
      </Typography>

      <Suspense fallback={<h1>Loading collection cases...</h1>}>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table
            stickyHeader
            sx={{
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
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Referentie
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Datum
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Reactietermijn
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Totaal te bedrag
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Betalingsregeling
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 50,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #bdbdbd",
                  }}
                  align="center"
                >
                  Overzicht
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collectionCases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {caseItem.reference_number}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    Aanmanning
                    {/* <CollectionStatusChip status={"AANMANNING"} /> */}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {formatDate(caseItem.issue_date?.toString() || "")}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {formatDate(caseItem.due_date?.toString() || "")}
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    {formatCurrency(
                      caseItem.amount_original + caseItem.amount_due
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCollectionCaseSelected(caseItem);
                        handleOpenModalAgreement();
                      }}
                      startIcon={<HandshakeIcon />}
                    >
                      Nieuwe regeling
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton>
                        <VisibilityIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Suspense>

      <Box sx={{ width: "100%", mt: 4 }}>
        <Tabs value={value} onChange={handleChange} aria-label="example tabs">
          <Tab value={0} label="Betalingsovereenkomsten" wrapped />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box sx={{ mt: 2 }}>
          <AgreementTable
            agreements={paymentAgreements}
            onDelete={onDeleteAgreement}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Box>
      </TabPanel>

      <Modal
        open={openModalAgreement}
        onClose={handleCloseModalAgreement}
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
            width: 400,
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
              NIEUWE OVEREENKOMST
            </Typography>
            <IconButton sx={{ color: "white" }}>
              <CloseIcon onClick={handleCloseModalAgreement} />
            </IconButton>
          </Box>
          <AgreementForm
            onSubmit={handleAgreementSubmit}
            initialData={{
              ...collectionCaseSelected,
              total_amount:
                (collectionCaseSelected?.amount_original ?? 0) +
                (collectionCaseSelected?.amount_due ?? 0),
              installments_count: 3,
              start_date: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              ),
              status: $Enums.AgreementStatus.PENDING,
            }}
            loading={loading}
          />
        </Paper>
      </Modal>
    </Container>
  );
};

export default DashboardDebtor;
