"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
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
import { useTenant } from "@/hooks/useTenant";
import { CollectionCaseResponse } from "@/lib/validations/collection";
import {
  getAllCollectionCases,
  processCollection,
} from "@/app/actions/collection";
import { AlertService } from "@/lib/alerts";
import { notifyError, notifyInfo } from "@/lib/notifications";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CollectionForm from "./collection-form";
import EditIcon from "@mui/icons-material/Edit";
import { formatCurrency, formatDate } from "@/common/utils/general";

const CollectionTable = () => {
  const router = useRouter();
  const { tenant } = useTenant();
  const [collectionCases, setCollectionCases] = React.useState<
    CollectionCaseResponse[]
  >([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] =
    React.useState<CollectionCaseResponse | null>(null);
  const [open, setOpen] = React.useState(false);
  const openMenu = Boolean(anchorEl);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const fetchInvoices = async () => {
    if (!tenant?.id) return;

    const data = await getAllCollectionCases(tenant.id);
    setCollectionCases(data);
  };

  React.useEffect(() => {
    if (!tenant?.id) return;

    fetchInvoices();
  }, [tenant?.id]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    verdict: CollectionCaseResponse
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(verdict);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/collections/${id}`);
  };

  const handleDelete = async (verdict: CollectionCaseResponse) => {
    AlertService.showConfirm(
      "¿Estás seguro?",
      "Esta acción eliminará el registro de la factura.",
      "Sí, eliminar",
      "Cancelar"
    ).then(async (confirmed) => {
      if (confirmed) {
        // const result = await deleteCollectionCase(verdict.id);
        // if (result) {
        //   notifyInfo("Factura eliminada exitosamente");
        //   fetchInvoices();
        // } else {
        //   notifyError("Error al eliminar la factura");
        // }
      }
    });
    return;
  };

  const handleProcess = async () => {
    if (!tenant) return;

    try {
      setLoading(true);
      await processCollection(tenant.id);
      await fetchInvoices();
      notifyInfo("Lista de facturas actualizada");
    } catch (error) {
      notifyError("Error al procesar las facturas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            OVERZICHT VORDERING
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Buscar..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
        </Box>
        <Box>
          <Stack spacing={2} direction="row">
            <IconButton
              color="primary"
              onClick={() => {
                handleProcess();
              }}
              loading={loading}
            >
              <RefreshIcon />
            </IconButton>
            <Button onClick={handleOpen} variant="contained" color="primary">
              NIEUWE VORDERING
            </Button>
          </Stack>
          <Modal
            open={open}
            onClose={handleClose}
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
                  alignItems: "left",
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 600 }}
                >
                  NIEUWE VORDERING
                </Typography>
              </Box>
              <CollectionForm />
            </Paper>
          </Modal>
        </Box>
      </Box>
      <TableContainer component={"div"}>
        <Table stickyHeader aria-label="sticky table">
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
                Datum vordering
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
                Debiteurnaam
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
                Vordering
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
                Te betalen
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
                Te ontvangen
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
                Actie
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectionCases.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell sx={{ textAlign: "center" }}>
                  {formatDate(invoice.issueDate?.toString() || "")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {invoice.debtor?.fullname}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {formatCurrency(invoice.amountOriginal)}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {formatCurrency(invoice.amountDue)}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {formatCurrency(invoice.amountToReceive)}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {invoice.status}
                </TableCell>
                {/* <TableCell>{actions(invoice)}</TableCell> */}
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                      handleEdit(invoice.id)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CollectionTable;
