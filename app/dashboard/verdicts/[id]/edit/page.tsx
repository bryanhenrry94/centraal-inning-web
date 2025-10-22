"use client";
import React, { useEffect } from "react";
import VerdictFormPage from "@/components/verdict/verdict-form";
import { VerdictProvider } from "@/contexts/verdictContext";
import ActionToolbar from "@/components/ui/breadcrums";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";

const VerdictPageEdit: React.FC = () => {
  const params = useParams();
  const id = (params.id as string) || "";

  useEffect(() => {
    if (!id) {
      console.error("ID is required to edit a verdict.");
      return;
    }
  }, [id]);

  return (
    <Box sx={{ m: 4 }}>
      {/* <ActionToolbar
        title="Editar"
        navigation={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Veredictos", href: "/dashboard/verdicts" },
        ]}
      /> */}
      <Box sx={{ mt: 2 }}>
        <VerdictProvider>
          <VerdictFormPage id={id} />
        </VerdictProvider>
      </Box>
    </Box>
  );
};

export default VerdictPageEdit;
