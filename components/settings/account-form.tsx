import { useEffect, useState } from "react";
// mui
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
// actions
import { getPlanById } from "@/app/actions/plan";
// hooks
import { useTenant } from "@/hooks/useTenant";
import { Plan } from "@/lib/validations/plan";
import { formatCurrency } from "@/common/utils/general";

export const AccountForm = () => {
  const { tenant } = useTenant();
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (tenant) {
      // Fetch the billing plan for the tenant
      const fetchPlan = async () => {
        if (!tenant.planId) return null;

        const data = await getPlanById(tenant.planId);
        if (!data) {
          setPlan(null);
          return;
        }
        setPlan({ ...data, description: data.description ?? undefined });
      };

      fetchPlan();
    }
  }, [tenant]);

  if (!tenant) {
    return (
      <Box p={2}>
        <Typography variant="h6">Cuenta</Typography>
        <Typography color="textSecondary">
          No hay información del tenant.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Datos de mi cuenta */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mijn accountgegevens
            </Typography>

            <TableContainer
              sx={{ mb: 2, display: "flex", justifyContent: "center" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Configuratie
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Beschrijving
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Naam:</TableCell>
                    <TableCell>{tenant.name ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Subdomein:</TableCell>
                    <TableCell>{tenant.subdomain ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E-mailadres voor contact:</TableCell>
                    <TableCell>{tenant.contactEmail ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Telefoon:</TableCell>
                    <TableCell>{tenant.phone ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Website:</TableCell>
                    <TableCell>{tenant.website ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Adres:</TableCell>
                    <TableCell>{tenant.address ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Stad:</TableCell>
                    <TableCell>{tenant.city ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Land (code):</TableCell>
                    <TableCell>{tenant.countryCode ?? ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aantal medewerkers:</TableCell>
                    <TableCell>
                      {tenant.numberOfEmployees != null
                        ? String(tenant.numberOfEmployees)
                        : ""}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Actief:</TableCell>
                    <TableCell>{tenant.isActive ? "Ja" : "Nee"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Plan contratado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gecontracteerd plan
            </Typography>

            <Typography variant="subtitle1">
              {tenant?.plan?.name ?? "Niet toegewezen"}
              {tenant?.plan?.description
                ? ` - ${tenant?.plan?.description}`
                : ""}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Prijs:{" "}
              {tenant?.plan ? formatCurrency(tenant.plan.price) : "Onbekend"}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Status: {tenant?.planStatus ?? "Onbekend"}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Plan expiration:{" "}
              {tenant.planExpiresAt ? (
                <>
                  {tenant.planExpiresAt instanceof Date
                    ? tenant.planExpiresAt.toLocaleString()
                    : tenant.planExpiresAt}
                </>
              ) : (
                "Onbekend"
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
