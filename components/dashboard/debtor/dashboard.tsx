"use client";
import React, { Suspense, useEffect, useState } from "react";
import LoadingUI from "@/components/ui/loading-ui";
import { getAllCollectionCasesByUserId } from "@/app/actions/collection";
import { CollectionCaseResponse } from "@/lib/validations/collection";
import {
  Container,
  Grid,
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useSession } from "next-auth/react";
import { formatCurrency, formatDate } from "@/common/utils/general";
import CollectionStatusChip from "@/components/ui/collection-status-chip";
import AgreementTable from "@/components/agreements/agreement-table";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
} from "@/lib/validations/payment-agreement";
import {
  createPaymentAgreement,
  existsPaymentAgreement,
  getPaymentAgreementsByCollection,
} from "@/app/actions/payment-agreement";
import { notifyError, notifyInfo } from "@/lib/notifications";
import TabPanel from "@/components/ui/tab-panel";
import AgreementForm from "@/components/agreements/agreement-form";
import { getAllNotificationsByCollectionCase } from "@/app/actions/notification";

const DashboardDebtor = () => {
  const { data: session } = useSession();
  const [paymentAgreements, setPaymentAgreements] = useState<
    PaymentAgreement[]
  >([]);
  const [loading, setLoading] = useState(false);
  const user = session?.user;
  const [value, setValue] = React.useState(0);

  const [collectionCaseSelected, setCollectionCaseSelected] =
    useState<CollectionCaseResponse | null>(null);
  const [collectionCases, setCollectionCases] = useState<
    CollectionCaseResponse[]
  >([]);
  const [notifications, setNotifications] = useState<
    | {
        id: string;
        collectionCaseId: string;
        type: string;
        title: string;
        message: string;
        sentAt: Date | string;
        read: boolean;
        createdAt: Date | string;
      }[]
    | null
  >(null);

  const [openModalAgreement, setOpenModalAgreement] = React.useState(false);
  const handleOpenModalAgreement = () => setOpenModalAgreement(true);
  const handleCloseModalAgreement = () => setOpenModalAgreement(false);

  useEffect(() => {
    fetchCollectionCases();
  }, []);

  const fetchCollectionCases = async () => {
    try {
      const data = await getAllCollectionCasesByUserId(
        user?.tenantId as string,
        user?.id as string
      );
      setCollectionCases(data);
    } catch (error) {
      console.error("Error fetching collection cases:", error);
    }
  };

  const fetchPaymentAgreements = async (id: string) => {
    try {
      setLoading(true);

      const data = await getPaymentAgreementsByCollection(id);
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

  const fetchNotifications = async (id: string) => {
    try {
      setLoading(true);

      const data = await getAllNotificationsByCollectionCase(id);
      console.log("Notifications Data:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      notifyError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAgreement = () => {
    if (!collectionCaseSelected) return;
    fetchPaymentAgreements(collectionCaseSelected?.id);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAgreementSubmit = async (data: PaymentAgreementCreate) => {
    // Implement submission logic here
    try {
      setLoading(true);
      console.log("Agreement Data Submitted:", data);

      if (!collectionCaseSelected?.id) return;

      if (data.startDate < new Date()) {
        notifyError("La fecha de inicio debe ser mayor a la fecha actual");
        return;
      }

      const exists = await existsPaymentAgreement(collectionCaseSelected?.id);
      if (exists) {
        notifyError("Ya existe un acuerdo de pago para esta collection");
        return;
      }

      await createPaymentAgreement(data);
      await fetchPaymentAgreements(collectionCaseSelected.id);
      handleCloseModalAgreement();
      notifyInfo("Payment agreement submitted successfully");
    } catch (error) {
      console.error("Error creating payment agreement:", error);
      notifyError("Error al crear el acuerdo de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Suspense fallback={<LoadingUI />}>
        <Typography variant="h4" gutterBottom>
          Mijn schulden
        </Typography>
        <Typography variant="body1" gutterBottom>
          Bekijk uw openstaande schulden en vraag betalingsregelingen aan.
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {collectionCases.map((caseItem) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caseItem.id}>
              <Paper
                elevation={3}
                onClick={() => {
                  setCollectionCaseSelected(caseItem);
                  fetchPaymentAgreements(caseItem.id);
                  fetchNotifications(caseItem.id);
                }}
                sx={{
                  p: 2,
                  ":hover": { boxShadow: 6 },
                  border:
                    caseItem.id === collectionCaseSelected?.id
                      ? "2px solid #F59421"
                      : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Referentie: {caseItem.referenceNumber}
                  </Typography>
                  <CollectionStatusChip status={caseItem.status} />
                </Box>
                <Typography variant="body1" gutterBottom>
                  Vervaldatum: {formatDate(caseItem.dueDate?.toString() || "")}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(caseItem.amountOriginal + caseItem.amountDue)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {collectionCaseSelected && (
          <>
            <Box sx={{ width: "100%", mt: 4 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="example tabs"
              >
                <Tab value={0} label="Betalingsovereenkomsten" wrapped />
                <Tab value={1} label="Betalingsgeschiedenis" />
                <Tab value={2} label="Notificaties" />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mb: 2 }}
                  disabled={collectionCaseSelected === null}
                  onClick={handleOpenModalAgreement}
                >
                  Nieuw
                </Button>
                <AgreementTable
                  paymentAgreements={paymentAgreements}
                  onDelete={onDeleteAgreement}
                />
              </Box>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Typography>Betalingsgeschiedenis inhoud hier</Typography>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <TabPanel value={value} index={2}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Datum</TableCell>
                          <TableCell align="right">Titel</TableCell>
                          <TableCell align="right">Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notifications?.map((notification) => (
                          <TableRow
                            key={notification.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              {notification.title}
                            </TableCell>
                            <TableCell align="right">
                              {notification.type}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </TabPanel>
            </TabPanel>
          </>
        )}

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
                collectionCaseId: collectionCaseSelected?.id || "",
                totalAmount:
                  (collectionCaseSelected?.amountOriginal ?? 0) +
                  (collectionCaseSelected?.amountDue ?? 0),
                installmentsCount: 3,
                installmentAmount: 0,
                startDate: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  0
                ),
                status: "ACTIVE",
              }}
              loading={loading}
            />
          </Paper>
        </Modal>
      </Suspense>
    </Container>
  );
};

export default DashboardDebtor;
