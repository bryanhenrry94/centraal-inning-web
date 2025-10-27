"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const UserAvatar = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleSignOut = async () => {
      await signOut({
        redirect: false,
      });
      handleClose();
      router.push("/");
      router.refresh();
    };

    if (!session) return null;

    return (
      <>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={handleOpen} sx={{ ml: 1, p: 0.5 }}>
            <Avatar
              alt={session.user?.name || "User"}
              src={session.user?.image || undefined}
              sx={{ width: 28, height: 28 }}
            />
          </IconButton>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="body1"
              component="span"
              sx={{ fontWeight: "bold", display: "block" }}
            >
              {session?.user?.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {session?.user?.email}
            </Typography>
          </Box>
          <MenuItem disabled>
            <Avatar
              alt={session.user?.name || "User"}
              src={session.user?.image || undefined}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            {session?.user?.name}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => router.push("/dashboard/settings")}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Configuratie
          </MenuItem>

          <MenuItem onClick={handleSignOut}>
            <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
            Afmelden
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      <AppBar position="static" elevation={0} color="secondary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Image
              src="/static/LogoCIO.svg"
              alt="Logo"
              height={70}
              width={130}
            />
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              textAlign: "center",
              flexGrow: 1,
              display: { xs: "none", md: "block" },
            }}
          >
            PORTAL CI
          </Typography>
          <Box>
            <UserAvatar />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
