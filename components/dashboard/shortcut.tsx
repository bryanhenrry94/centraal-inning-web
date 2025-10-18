"use client";
import React from "react";
import Link from "next/link";
import { Box, Container, Stack, Button } from "@mui/material";
import { usePathname } from "next/navigation";
import Modal from "@mui/material/Modal";

export const Shortcut = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const items = [
    {
      id: 1,
      name: "Reporte Financiero",
      description: "Un informe detallado sobre la situación financiera",
      price: 45.0,
    },
  ];

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "calc(100vh - 150px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 0,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}
      >
        <Button
          component={Link}
          href={`${pathname}/collections`}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            flex: 1,
            minWidth: 270,
            minHeight: 120,
            fontSize: "1.5rem",
            textTransform: "none",
            boxShadow: 3,
            // borderRadius: 3,
          }}
        >
          Buitengerechtelijk
        </Button>
        <Button
          component={Link}
          href={`${pathname}/verdicts`}
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            flex: 1,
            minWidth: 270,
            minHeight: 120,
            fontSize: "1.5rem",
            textTransform: "none",
            boxShadow: 3,
          }}
        >
          Gerechtelijk Vonnis
        </Button>
        <Button
          onClick={handleOpen}
          variant="outlined"
          color="primary"
          size="large"
          sx={{
            flex: 1,
            minWidth: 270,
            minHeight: 120,
            fontSize: "1.5rem",
            textTransform: "none",
            boxShadow: 3,
          }}
        >
          Aanvraag Financieel
        </Button>
      </Stack>
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
            width: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          {/* <PaymentCard items={items} onSuccess={handlePaymentSuccess} /> */}
        </Box>
      </Modal>
    </Container>
  );
};
