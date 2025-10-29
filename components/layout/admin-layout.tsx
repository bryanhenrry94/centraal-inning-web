import { ReactNode } from "react";
import Header from "./header";
import Navigation from "./navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingUI from "@/components/ui/loading-ui";
import { Box } from "@mui/material";

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuthSession();

  if (!user) {
    return <LoadingUI />;
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header />
        <Navigation role={user.role} />
        <main className="flex-1 p-6 bg-gray-50; scroll-y-auto">{children}</main>
        <footer className="p-4 text-center text-sm text-gray-500">
          {/* &copy; {new Date().getFullYear()} CI Systeem. All rights reserved. */}
          Klantnummer: CIARU001
        </footer>
      </Box>
    </>
  );
};
