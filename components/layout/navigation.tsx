"use client";
import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import ChatIcon from "@mui/icons-material/Chat";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  role?: string[];
};

const menus: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon fontSize="small" />,
    role: ["ADMIN", "SUPERADMIN", "DEBTOR"],
  },
  {
    label: "Verzameltaken",
    href: "/dashboard/collections",
    icon: <ReceiptOutlinedIcon fontSize="small" />,
    role: ["ADMIN"],
  },
  {
    label: "Vonnis",
    href: "/dashboard/verdicts",
    icon: <GavelIcon fontSize="small" />,
    role: ["ADMIN"],
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: <ReceiptOutlinedIcon fontSize="small" />,
    role: ["SUPERADMIN"],
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: <ChatIcon fontSize="small" />,
    role: ["ADMIN", "DEBTOR"],
  },
];

const Navigation = ({ role }: { role: string }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const items = menus.filter((item) => item.role?.includes(role));
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
