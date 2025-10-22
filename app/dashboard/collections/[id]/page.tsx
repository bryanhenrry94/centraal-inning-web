"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CollectionCaseView } from "@/lib/validations/collection";
import { Payment } from "@/lib/validations/payment";
import { getCollectionViewById } from "@/app/actions/collection";
import { notifyError, notifyInfo } from "@/lib/notifications";
import { formatCurrency } from "@/common/utils/general";
import { getPaymentsByInvoice } from "@/app/actions/payment";
import PaymentForm from "@/components/payment/payment-form";
import {
  getAllNotificationsByCollectionCase,
  sendNotification,
} from "@/app/actions/notification";
import { Notification } from "@/lib/validations/notification";
import TabPanel from "@/components/ui/tab-panel";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
} from "@/lib/validations/payment-agreement";
import {
  createPaymentAgreement,
  existsPaymentAgreement,
  getPaymentAgreementsByCollection,
} from "@/app/actions/payment-agreement";
import AgreementForm from "@/components/agreements/agreement-form";
import AgreementTable from "@/components/agreements/agreement-table";

const CollectionViewPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [collection, setCollection] = React.useState<CollectionCaseView | null>(
    null
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null
  );
  const [value, setValue] = React.useState(0);
  const [paymentAgreements, setPaymentAgreements] = useState<
    PaymentAgreement[]
  >([]);

  const [openModalPayment, setOpenModalPayment] = React.useState(false);
  const handleOpenModalPayment = () => setOpenModalPayment(true);
  const handleCloseModalPayment = () => setOpenModalPayment(false);

  const [openModalAgreement, setOpenModalAgreement] = React.useState(false);
  const handleOpenModalAgreement = () => setOpenModalAgreement(true);
  const handleCloseModalAgreement = () => setOpenModalAgreement(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const params = useParams();

  useEffect(() => {
    fetchInvoice();
    fetchPayments();
    fetchNotifications();
    fetchPaymentAgreements();
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      if (!params.id) {
        notifyError("ID de collection no proporcionado");
        router.back();
        return;
      }
      const data = await getCollectionViewById(params.id as string);
      if (data) {
        setCollection(data);
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
      notifyError("Error al cargar la collection");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (!params.id) {
        notifyError("ID de collection no proporcionado");
        router.back();
        return;
      }

      const data = await getPaymentsByInvoice(params.id as string);
      if (data) {
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      notifyError("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!params.id) {
        notifyError("ID de collection no proporcionado");
        router.back();
        return;
      }

      const data = await getAllNotificationsByCollectionCase(
        params.id as string
      );
      console.log("Notifications Data:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      notifyError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      if (!params.id) {
        notifyError("ID de collection no proporcionado");
        router.back();
        return;
      }

      await sendNotification(params.id as string);
      await fetchNotifications();

      notifyInfo("Notificación enviada exitosamente");
    } catch (error) {
      console.error("Error sending notification:", error);
      notifyError("Error al enviar la notificación");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentAgreements = async () => {
    try {
      setLoading(true);
      if (!params.id) {
        notifyError("ID de collection no proporcionado");
        router.back();
        return;
      }

      const data = await getPaymentAgreementsByCollection(params.id as string);
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

  const handleAgreementSubmit = async (data: PaymentAgreementCreate) => {
    // Implement submission logic here
    try {
      setLoading(true);
      console.log("Agreement Data Submitted:", data);

      if (data.startDate < new Date()) {
        notifyError("La fecha de inicio debe ser mayor a la fecha actual");
        return;
      }

      const exists = await existsPaymentAgreement(params.id as string);
      if (exists) {
        notifyError("Ya existe un acuerdo de pago para esta collection");
        return;
      }

      await createPaymentAgreement(data);
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

  const onDeleteAgreement = async () => {
    await fetchPaymentAgreements();
  };

  return (
    <Container maxWidth="lg">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ mb: 4 }}>
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
              alignItems: "left",
            }}
          >
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              OVERZICHT VORDERING
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Datum vordering:{" "}
              {(() => {
                const d = collection?.issueDate;
                if (!d) return "N/A";
                return typeof d === "string"
                  ? new Date(d).toLocaleDateString()
                  : d.toLocaleDateString();
              })()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Debiteurnaam:{" "}
              {collection?.debtor.fullname ? collection.debtor.fullname : "N/A"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vordering: {formatCurrency(collection?.amountOriginal || 0)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Te betalen: {formatCurrency(collection?.amountDue || 0)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Te ontvangen: {formatCurrency(collection?.amountToReceive || 0)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Status: {collection?.status || "N/A"}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ width: "100%" }}>
          <Tabs value={value} onChange={handleChange} aria-label="example tabs">
            <Tab value={0} label="Betalingen" wrapped />
            <Tab value={1} label="Overeenkomsten" />
            <Tab value={2} label="Notificaties" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleOpenModalPayment}
            >
              Nieuwe betaling
            </Button>
            <Modal
              open={openModalPayment}
              onClose={handleCloseModalPayment}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <PaymentForm />
              </Box>
            </Modal>

            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Betalingsdatum</TableCell>
                    <TableCell align="right">Bedrag</TableCell>
                    <TableCell align="right">Betaalmethode</TableCell>
                    <TableCell align="right">Referentienummer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow
                      key={payment.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell align="right">{payment.method}</TableCell>
                      <TableCell align="right">
                        {payment.referenceNumber || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleOpenModalAgreement}
            >
              NIEUWE OVEREENKOMST
            </Button>
            <AgreementTable
              paymentAgreements={paymentAgreements}
              onDelete={onDeleteAgreement}
            />
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
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    NIEUWE OVEREENKOMST
                  </Typography>
                  <IconButton sx={{ color: "white" }}>
                    <CloseIcon onClick={handleCloseModalAgreement} />
                  </IconButton>
                </Box>
                <AgreementForm
                  onSubmit={handleAgreementSubmit}
                  initialData={{
                    collectionCaseId: params.id as string,
                    totalAmount: collection?.amountOriginal || 0,
                    installmentsCount: 0,
                    installmentAmount: 0,
                    startDate: new Date(),
                    status: "ACTIVE",
                  }}
                  loading={loading}
                />
              </Paper>
            </Modal>
          </Box>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={handleSendNotification}
            >
              Send New Notification
            </Button>
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
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{notification.title}</TableCell>
                      <TableCell align="right">{notification.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Container>
    </Container>
  );
};

export default CollectionViewPage;
