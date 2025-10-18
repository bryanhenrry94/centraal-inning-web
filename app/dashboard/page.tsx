"use client";
import React from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingUI from "@/components/ui/loading-ui";
import { Shortcut } from "@/components/dashboard/shortcut";

const CompanyHomePage = () => {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) {
    return <LoadingUI />;
  }

  if (!isAuthenticated) return <>No autorizado. Por favor, inicie sesión.</>;

  return (
    <>
      <Shortcut />
    </>
  );
};

export default CompanyHomePage;
