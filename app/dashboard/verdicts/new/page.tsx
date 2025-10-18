"use client";
import React from "react";
import VerdictFormPage from "@/components/verdict/verdict-form";
import { VerdictProvider } from "@/contexts/verdictContext";
import ActionToolbar from "@/components/ui/breadcrums";
import { Box } from "@mui/material";

const VerdictPage: React.FC = () => {
  return (
    <Box sx={{ m: 4 }}>
      <ActionToolbar
        title="Nieuw"
        navigation={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Vonnis", href: "/dashboard/verdicts" },
        ]}
      />
      <Box sx={{ mt: 8 }}>
        <VerdictProvider>
          <VerdictFormPage />
        </VerdictProvider>
      </Box>
    </Box>
  );
};

export default VerdictPage;
