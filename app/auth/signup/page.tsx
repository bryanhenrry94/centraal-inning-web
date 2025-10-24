"use client";

import { useRouter } from "next/navigation";
import { Container, Typography, Stack, Button, Box } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import LogoComponent from "@/components/ui/logo-app";
import Link from "next/link";

const SignUpPage = () => {
  const router = useRouter();

  const goTo = (type: "debtor" | "company") => {
    router.push(`/auth/signup/${type}`);
  };

  return (
    <Box
      minHeight="calc(100vh - 32px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ p: 4, bgcolor: "background.default", color: "text.primary" }}
    >
      <Box mb={3} textAlign="center">
        <LogoComponent />
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Selecteer een accounttype
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={() => goTo("debtor")}
          aria-label="Registrarse como deudor"
          startIcon={<PersonAddIcon />}
        >
          DEBITEUR
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          fullWidth
          onClick={() => goTo("company")}
          aria-label="Registrarse como empresa"
          startIcon={<BusinessIcon />}
        >
          BEDRIJF
        </Button>
      </Stack>
      <Box
        sx={{
          mt: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          <span>Heeft u nog geen account?</span>
          <Link href="/" passHref>
            <Button variant="text">Inloggen</Button>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUpPage;
