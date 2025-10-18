import React, { Suspense } from "react";
import { Container } from "@mui/material";
import TableInvoices from "@/components/collection/collection-table";

const CollectionsPage = async () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Suspense fallback={<div>Loading....</div>}>
        <TableInvoices />
      </Suspense>
    </Container>
  );
};

export default CollectionsPage;
