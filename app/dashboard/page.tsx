"use client";
import React from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingUI from "@/components/ui/loading-ui";
import DashboardSuperAdmin from "@/components/dashboard/superadmin/dashboard";
import { DashboardAdmin } from "@/components/dashboard/admin/dashboard";
import DashboardDebtor from "@/components/dashboard/debtor/dashboard";
import { $Enums } from "@/prisma/generated/prisma";

const CompanyHomePage = () => {
  const { isAuthenticated, isLoading, user } = useAuthSession();

  if (isLoading) {
    return <LoadingUI />;
  }

  if (!isAuthenticated) return <>No autorizado. Por favor, inicie sesión.</>;

  if (user?.role === $Enums.roleEnum.PLATFORM_OWNER) {
    return <DashboardSuperAdmin />;
  }

  if (user?.role === $Enums.roleEnum.TENANT_ADMIN) {
    return <DashboardAdmin />;
  }

  if (user?.role === $Enums.roleEnum.DEBTOR) {
    return <DashboardDebtor />;
  }

  return <div>Rol de usuario no reconocido.</div>;
};

export default CompanyHomePage;
