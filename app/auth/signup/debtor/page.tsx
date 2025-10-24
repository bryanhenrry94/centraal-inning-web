"use client";
import React, { useState } from "react";
import Link from "next/link";
// mui
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// validations & actions
import {
  DebtorSignUp,
  initialTenantSignUp,
  ITenantSignUp,
} from "@/lib/validations/signup";
import { notifyError, notifyInfo, notifyWarning } from "@/lib/notifications";
import useClientRouter from "@/hooks/useNavigations";
import { createAccount, createAccountDebtor } from "@/app/actions/auth";

// components
import AccountInfoCard from "@/components/signup/account-info-card";
import CompanyInfoCard from "@/components/signup/company-info-card";
import TermsAndConditionsCard from "@/components/signup/terms-and-conditions-card";
import OnboardingLayout from "@/components/onboarding/onboarding-layout";
import CardContainer from "@/components/signup/card-container";
import HeaderInfoCard from "@/components/signup/header-info-card";
import { userExistsByEmail } from "@/app/actions/user";

export default function SignUpDebtorPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = useState<DebtorSignUp>({
    reference_number: "",
    email: "",
    fullname: "",
    password: "",
  });
  const { redirectToLoginCompany, redirectToSlugLoginCompany } =
    useClientRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Check if email already exists
      const emailExists = await userExistsByEmail(formData.email);
      if (emailExists) {
        notifyWarning("Email already exists.");
        return;
      }

      // Create debtor account
      const result = await createAccountDebtor(formData);

      if (!result.status) {
        notifyWarning(
          "Er is een fout opgetreden bij het aanmaken van uw account: " +
            (result.error || "Onbekende fout")
        );
        return;
      }

      notifyInfo("Account succesvol aangemaakt. U kunt nu inloggen.");

      if (result.subdomain) {
        redirectToSlugLoginCompany(result.subdomain, formData.email);
      } else {
        redirectToLoginCompany();
      }
    } catch (error) {
      console.log(error);
      notifyError("Er is een onverwachte fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <OnboardingLayout
        backgroundImageUrl={"/static/images/auth/sign_up_2.jpg"}
      >
        <Box
          component={"form"}
          onSubmit={handleSubmit}
          sx={{ minWidth: 350, maxWidth: { xs: 400, sm: 600, md: 400 } }}
        >
          <HeaderInfoCard
            title={"Gebruikersinformatie"}
            subtitle={"Vul de gegevens in om door te gaan"}
            logoSrc={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          />
          <TextField
            name="reference_number"
            label="Referentienummer"
            type="text"
            fullWidth
            required
            margin="dense"
            value={formData.reference_number}
            onChange={(e) =>
              setFormData({
                ...formData,
                reference_number: e.target.value,
              })
            }
          />

          <TextField
            name="email"
            label="Zakelijk e-mailadres"
            type="email"
            fullWidth
            required
            margin="dense"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <TextField
            name="fullname"
            label="Volledige naam"
            type="text"
            fullWidth
            required
            margin="dense"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({
                ...formData,
                fullname: e.target.value,
              })
            }
          />

          <TextField
            name="password"
            label="Wachtwoord"
            type="password"
            fullWidth
            required
            margin="dense"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            loading={loading}
            sx={{ mt: 1 }}
          >
            Maak account aan
          </Button>
        </Box>
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
      </OnboardingLayout>
    </>
  );
}
