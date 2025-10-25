import {
  Box,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CollectionCaseNotification } from "@/prisma/generated/prisma";
import CloseIcon from "@mui/icons-material/Close";

interface ModalNotificationsProps {
  open: boolean;
  onClose: () => void;
  notifications: CollectionCaseNotification[];
}

export const ModalNotifications: React.FC<ModalNotificationsProps> = ({
  open,
  onClose,
  notifications,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      {/* Modal content goes here */}
      <Box
        sx={{
          mt: 2,
          elevation: 1,
          borderRadius: 1,
          overflow: "hidden",
          mb: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            NOTIFICATIES
          </Typography>
          <IconButton sx={{ color: "white" }}>
            <CloseIcon onClick={onClose} />
          </IconButton>
        </Box>
        <Box sx={{ p: 2, bgcolor: "background.paper" }}>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell align="right">Titel</TableCell>
                  <TableCell align="right">Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications?.map((notification) => (
                  <TableRow
                    key={notification.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">{notification.title}</TableCell>
                    <TableCell align="right">{notification.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalNotifications;
