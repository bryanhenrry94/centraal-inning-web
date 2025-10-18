import React, { Suspense } from "react";
import { Container } from "@mui/material";
import CollectionTable from "@/components/collection/collection-table";
import LoadingUI from "@/components/ui/loading-ui";

const CollectionsPage = async () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Suspense fallback={<LoadingUI />}>
        <CollectionTable />
      </Suspense>
    </Container>
  );
};

export default CollectionsPage;
