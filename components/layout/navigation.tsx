"use client";
import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type MenuConfig = {
  [role: string]: MenuItem[];
};

const menuConfig: MenuConfig = {
  MANAGER: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <HomeOutlinedIcon fontSize="small" />,
    },
    {
      label: "Collections",
      href: "/dashboard/collections",
      icon: <ReceiptOutlinedIcon fontSize="small" />,
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: <BarChartOutlinedIcon fontSize="small" />,
    },
  ],
  USER: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Collections", href: "/dashboard/collections" },
    { label: "Clients", href: "/dashboard/clients" },
    { label: "Reports", href: "/dashboard/reports" },
  ],
};

const Navigation = ({ role }: { role: string }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const items = menuConfig[role] ?? [];
  const navValue = items.findIndex((item) => item.href === pathname);

  return (
    <Paper elevation={0} sx={{ borderRadius: 0 }}>
      <BottomNavigation
        value={navValue === -1 ? 0 : navValue}
        showLabels
        sx={{
          justifyContent: "space-around",
          py: 1,
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            fontWeight: "bold",
          },
          "& .MuiBottomNavigationAction-label": {
            borderBottom: "none",
          },
        }}
      >
        {items.map((item, idx) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            value={idx}
            component={NextLink}
            href={item.href}
            sx={{
              minWidth: 0,
              mx: 1,
              px: 1,
              py: 0.5,
              fontSize: "0.9rem",
              maxWidth: 140,
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;
