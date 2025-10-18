"use client";
import React, { useEffect, useState } from "react";
// mui
import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
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
import ArticleIcon from "@mui/icons-material/Article";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
// react-hook-form
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// validations
import { VerdictCreate, VerdictCreateForm } from "@/lib/validations/verdict";
import { notifyError, notifyInfo } from "@/lib/notifications";
// actions
import {
  createVerdict,
  DeleteVerdictAttachment,
  DownloadVerdictAttachment,
  getAttachmentsByVerdictId,
  getVerdictById,
  handleSendMailNotificationBailiff,
  requestVerdictApproval,
  updateVerdict,
  UploadAttachmentToVerdict,
} from "@/app/actions/verdict";
import { DebtorBase } from "@/lib/validations/debtor";
// hooks and libs
import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { AlertService } from "@/lib/alerts";
import Dropzone from "react-dropzone";
// components
import VerdictSectionForm from "@/components/verdict/verdict-section-form";
import InteresSection from "@/components/verdict/interest-section-form";
import FormErrors from "@/components/ui/form-errors";
import EmbargoSection from "@/components/verdict/embargo-section-form";
import VerdictTotals from "@/components/verdict/verdict-totals";
import TotalInterest from "@/components/verdict/total-interest";
import BailiffSection from "@/components/verdict/bailiff-section-form";
import { VerdictAttachment } from "@/lib/validations/verdict-attachments";
import TotalBailiff from "@/components/verdict/total-bailiff";

interface VerdictFormPageProps {
  id?: string;
}

const VerdictFormPage: React.FC<VerdictFormPageProps> = ({ id }) => {
  const { tenant } = useTenant();
  const [modeEdit, setModeEdit] = useState(false);
  const [openModalDebtor, setOpenModalDebtor] = React.useState(false);
  const [debtorSelected, setDebtorSelected] =
    React.useState<DebtorBase | null>();
  const [file, setFile] = useState<File[]>([]);
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [open, setOpen] = React.useState(false);
  const [attachments, setAttachments] = useState<VerdictAttachment[] | []>([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleUploadFile = async (files: File[]) => {
    handleClose();

    if (!id) {
      notifyError("El vonnis debe ser creado antes de subir un archivo.");
      return;
    }

    files.forEach(async (file) => {
      const res = await UploadAttachmentToVerdict(
        file,
        id,
        tenant?.subdomain || "default"
      );

      if (res) {
        notifyInfo("Archivo subido exitosamente.");
      } else {
        notifyError("Error al subir el archivo.");
      }
    });

    handleLoadAttachments();
  };

  useEffect(() => {
    setModeEdit(false);

    if (id) {
      const fetchVerdict = async () => {
        const verdict = await getVerdictById(id);
        if (verdict) {
          reset(verdict);

          setModeEdit(true);
          setStatus(verdict.status);
          handleLoadAttachments();
        }
      };
      fetchVerdict();
    }
  }, [id]);

  const handleSelectDebtor = (debtor: DebtorBase | null) => {
    if (debtor) {
      setDebtorSelected(debtor);
    } else {
      setDebtorSelected(null);
    }
  };

  const handleModalDebtor = () => {
    setOpenModalDebtor(true);
  };

  const handleCloseNewDebtor = () => {
    setOpenModalDebtor(false);
  };
  const methods = useForm<z.infer<typeof VerdictCreateForm>>({
    resolver: zodResolver(VerdictCreateForm) as unknown as Resolver<
      z.infer<typeof VerdictCreateForm>
    >,
    defaultValues: {
      invoiceNumber: "",
      creditorName: "",
      debtorId: "",
      registrationNumber: "",
      sentenceAmount: 0,
      sentenceDate: new Date(),
      procesalCost: 0,
      bailiffId: null,
      verdictInterest: [],
      verdictEmbargo: [],
      bailiffServices: [],
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;
  const onSubmit = async (data: z.infer<typeof VerdictCreateForm>) => {
    if (id) {
      await updateVerdict(id, data);
      notifyInfo("Registratie is bijgewerkt");
    } else {
      if (!tenant) {
        notifyError(
          "Onverwerkte fout, neem contact op met uw systeembeheerder"
        );
        return;
      }

      AlertService.showConfirm(
        "Weet je het zeker?",
        "Deze actie registreert het vonnis. Wil je doorgaan?",
        "Ja, registreren",
        "Annuleren"
      ).then(async (confirmed) => {
        if (confirmed) {
          const newVerdict = await createVerdict(data, tenant?.id);
          if (newVerdict) {
            notifyInfo("Registratie is succesvol aangemaakt");
            router.push(`/verdicts/${newVerdict.id}/edit`); // Redirect to the newly created verdict page
          }
        }
      });
    }

    reset();
  };

  const handleRequestApproval = async () => {
    if (!id) return;

    if (!tenant) return;

    AlertService.showConfirm(
      "Weet je het zeker?",
      "Deze actie vraagt goedkeuring voor het vonnis. Wil je doorgaan?",
      "Ja, aanvragen",
      "Annuleren"
    ).then(async (confirmed) => {
      if (confirmed) {
        await requestVerdictApproval(id);
        notifyInfo("Aanvraag voor goedkeuring verzonden");

        // tenant?.subdomain
        await handleSendMailNotificationBailiff(id);
        notifyInfo("We hebben een melding naar de deurwaarder gestuurd.");

        router.push(`/verdicts`);
      }
    });
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (id) {
      AlertService.showConfirm(
        "Weet je het zeker?",
        "Deze actie verwijdert het geselecteerde bestand. Wilt u doorgaan?",
        "Ja, verwijderen",
        "Annuleren"
      ).then(async (confirmed) => {
        if (confirmed) {
          await DeleteVerdictAttachment(attachmentId);
          notifyInfo("Bestand succesvol verwijderd.");
          handleLoadAttachments();
        }
      });

      return;
    }
  };

  const handleLoadAttachments = async () => {
    if (id) {
      const attachments = await getAttachmentsByVerdictId(id);
      if (attachments) {
        setAttachments(attachments);
      }
    }
  };

  const handleDownloadAttachment = async (id: string) => {
    const data = await DownloadVerdictAttachment(id);

    if (data.success && data.file) {
      // Decode base64 to binary
      const byteCharacters = atob(data.file as string);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.fileName ?? "documento.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      notifyError("Er is geen bestand om te downloaden.");
    }
  };

  return (
    <FormProvider {...methods}>
      <Box component={"form"} onSubmit={handleSubmit(onSubmit)}>
        {/* Vonnis Information Section */}
        <Paper
          component="section"
          sx={{
            mt: 2,
            elevation: 1,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
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
            }}
          >
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              NIEUW VONNIS TOEVOEGEN
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <VerdictSectionForm
              onOpenModalDebtor={handleModalDebtor}
              onSelectDebtor={handleSelectDebtor}
              debtorSelected={debtorSelected || null}
            />
          </Box>
        </Paper>

        <Paper
          component="section"
          sx={{
            mt: 2,
            elevation: 1,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
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
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                WETTELIJKE RENTE
              </Typography>

              <Box sx={{ mr: 2 }}>
                <TotalInterest control={control} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <InteresSection />
          </Box>
        </Paper>

        <Paper
          component="section"
          sx={{
            mt: 2,
            elevation: 1,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
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
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                BESLAG
              </Typography>

              <Box sx={{ mr: 2 }}>
                <TotalInterest control={control} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <EmbargoSection />
          </Box>
        </Paper>

        <Paper
          component="section"
          sx={{
            mt: 2,
            elevation: 1,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
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
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Betekeningskosten
              </Typography>

              <Box sx={{ mr: 2 }}>
                <TotalBailiff control={control} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <BailiffSection />
          </Box>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid
              container
              direction="column"
              justifyContent="start"
              alignItems="center"
              sx={{ minHeight: 200, mt: 2, height: "100%" }}
            >
              {modeEdit && (
                <Box
                  sx={{
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Button
                    variant="contained"
                    component="span"
                    sx={{ mb: 2, mt: 2 }}
                    onClick={handleOpen}
                  >
                    Document Uploaden
                  </Button>

                  <TableContainer component={Paper}>
                    <Table
                      stickyHeader
                      sx={{
                        minWidth: 500,
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
                              minWidth: 100,
                              backgroundColor: "secondary.main",
                              color: "#fff",
                              fontWeight: "bold",
                              border: "1px solid #bdbdbd",
                            }}
                            align="left"
                          >
                            Overzicht Documenten
                          </TableCell>
                          {/* <TableCell
                            sx={{
                              minWidth: 50,
                              backgroundColor: "secondary.main",
                              color: "#fff",
                              fontWeight: "bold",
                              border: "1px solid #bdbdbd",
                            }}
                            align="center"
                          >
                            Maat
                          </TableCell> */}
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
                            Acties
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attachments &&
                          attachments.length > 0 &&
                          attachments?.map((attachment) => (
                            <TableRow key={attachment.id}>
                              <TableCell
                                component="th"
                                scope="row"
                                align="left"
                              >
                                {attachment.fileName ? (
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                    onClick={() =>
                                      handleDownloadAttachment(attachment.id)
                                    }
                                    style={{
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                      color: "#1976d2",
                                    }}
                                  >
                                    {attachment.fileName}
                                  </Typography>
                                ) : (
                                  "No hay archivo cargado"
                                )}
                              </TableCell>
                              {/* <TableCell align="center">
                                {`${(
                                  Number(attachment.fileSize || 0) /
                                  (1024 * 1024)
                                ).toFixed(2)} MB`}
                              </TableCell> */}
                              <TableCell align="center">
                                {attachment.createdAt
                                  ? new Date(
                                      attachment.createdAt
                                    ).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    })
                                  : "-"}
                              </TableCell>
                              <TableCell align="center">
                                {file ? (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent="center"
                                  >
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleDeleteAttachment(attachment.id)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Stack>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        width: { xs: 350, sm: 600 },
                        maxWidth: "95vw",
                        borderRadius: 3,
                        p: { xs: 2, sm: 4 },
                        outline: "none",
                      }}
                    >
                      <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ mr: 1, color: "secondary.main" }}>
                          <UploadIcon />
                        </Box>
                        Document Uploaden
                      </Typography>
                      <Dropzone
                        accept={{
                          "application/pdf": [".pdf"],
                        }}
                        onDrop={(acceptedFiles) => {
                          if (acceptedFiles.length > 0) {
                            handleUploadFile(acceptedFiles);
                          }
                        }}
                        multiple={false}
                        maxFiles={1}
                        // maxSize={10 * 1024 * 1024}
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <Box
                            {...getRootProps()}
                            sx={{
                              border: "2px dashed #90a4ae",
                              borderRadius: 3,
                              p: { xs: 3, sm: 5 },
                              textAlign: "center",
                              cursor: "pointer",
                              bgcolor: isDragActive ? "#e3e8f0" : "#f8fafc",
                              transition: "background-color 0.2s",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                              borderStyle: "dashed",
                              borderWidth: 2,
                              borderColor: "#90a4ae",
                            }}
                          >
                            <Box
                              sx={{
                                background: "#e3e8f0",
                                borderRadius: "50%",
                                width: 70,
                                height: 70,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                              }}
                            >
                              <ArticleIcon />
                            </Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 500, mb: 1 }}
                            >
                              Sleep en zet bestanden hier neer, of klik om te
                              selecteren
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              Formaten ondersteund: PDF (max. 2MB)
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              sx={{
                                borderRadius: 2,
                                px: 3,
                                fontWeight: 500,
                                mb: 1,
                                textTransform: "none",
                              }}
                            >
                              Selecteer Bestanden
                            </Button>
                            <input
                              {...getInputProps()}
                              style={{ display: "none" }}
                            />
                          </Box>
                        )}
                      </Dropzone>
                    </Box>
                  </Modal>
                </Box>
              )}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <VerdictTotals />
          </Grid>
        </Grid>

        <FormErrors errors={errors} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                mt: 2,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  aria-label="delete"
                  color="primary"
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Bewaar Vonnis
                </Button>
                {status === "DRAFT" && (
                  <Button
                    aria-label="pending"
                    color="secondary"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleRequestApproval}
                  >
                    Vraag goedkeuring aan
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* <ModalDeudor
          open={openModalDebtor}
          id={debtorSelected?.id || ""}
          onDebtorSelect={handleSelectDebtor}
          onClose={handleCloseNewDebtor}
        /> */}
      </Box>
    </FormProvider>
  );
};

export default VerdictFormPage;
