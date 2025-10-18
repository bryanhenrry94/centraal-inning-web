"use client";
import { useEffect, useRef, useState } from "react";
// mui
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
} from "@mui/material";
// components
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
// libs
import { socket } from "@/lib/socketClient";
// data types
const InitialInvoices = [
  {
    id: "1",
    invoiceNumber: "INV001",
    debtorName: "Juan Pérez",
    description: "Juan Pérez (INV001)",
  },
  {
    id: "2",
    invoiceNumber: "INV002",
    debtorName: "María López",
    description: "María López (INV002)",
  },
  {
    id: "3",
    invoiceNumber: "INV003",
    debtorName: "Carlos García",
    description: "Carlos García (INV003)",
  },
  {
    id: "4",
    invoiceNumber: "INV004",
    debtorName: "Ana Martínez",
    description: "Ana Martínez (INV004)",
  },
  {
    id: "5",
    invoiceNumber: "INV005",
    debtorName: "Luis Fernández",
    description: "Luis Fernández (INV005)",
  },
  {
    id: "6",
    invoiceNumber: "INV006",
    debtorName: "Laura Sánchez",
    description: "Laura Sánchez (INV006)",
  },
  {
    id: "7",
    invoiceNumber: "INV007",
    debtorName: "Pedro Ramírez",
    description: "Pedro Ramírez (INV007)",
  },
  {
    id: "8",
    invoiceNumber: "INV008",
    debtorName: "Sofía Torres",
    description: "Sofía Torres (INV008)",
  },
];

function ChatWindow({ room, fullname, email }: ChatWindowProps) {
  const [messages, setMessages] = useState<
    {
      sender: string;
      message: string;
      fullname: string;
      fileUrl?: string;
      fileName?: string;
    }[]
  >([]);
  const [typingMessage, setTypingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Limpia los mensajes al cambiar de sala
    setMessages([]);

    console.log(`fullname: ${fullname}`);
    console.log(`email: ${email}`);
    console.log(`room: ${room.id}`);

    socket.emit("join-room", { room: room.id, fullname, email });

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", ({ message, fullname, email }) => {
      setMessages((prev) => [
        ...prev,
        { sender: "System", message, fullname, email },
      ]);
    });

    socket.on("message_history", (history) => {
      console.log("history", history);
      setMessages(history);
    });

    socket.on("file", ({ sender, fileName, fileUrl, fullname, email }) => {
      setMessages((prev) => [
        ...prev,
        {
          sender,
          message: `Archivo: ${fileName}`,
          fileUrl,
          fullname,
          fileName,
          email,
        },
      ]);
    });

    socket.on("user_typing", (message) => {
      setTypingMessage(message);
    });

    socket.on("user_stop_typing", () => {
      setTypingMessage("");
    });

    return () => {
      socket.off("user_joined");
      socket.off("message");
      socket.off("message_history");
      socket.off("file");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [room.id, fullname, email]); // Dependencia de `room` para ejecutar este efecto al cambiar de sala

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        sender: email,
        fileName: file.name,
        fileUrl: reader.result,
        fullname,
        room: room.id,
        email,
      };
      socket.emit("file", fileData);
      setMessages((prev) => [
        ...prev,
        {
          sender: email,
          message: `Archivo: ${file.name}`,
          fileUrl: reader.result as string,
          fullname,
          email,
          fileName: file.name,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleMessage = (message: string) => {
    const data = {
      room: room.id,
      message,
      sender: email,
      email,
      fullname,
    };
    setMessages((prev) => [
      ...prev,
      { sender: email, message, fullname, email },
    ]);
    socket.emit("message", data);
    socket.emit("stop_typing", { room: room.id });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // backgroundColor: "#f0f0f0",
        borderRadius: "8px", // Add border radius to the entire container
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #ddd",
          // backgroundColor: "primary.main",
          // color: "#fff",
          borderTopLeftRadius: "8px", // Add border radius to the top corners
          borderTopRightRadius: "8px",
        }}
      >
        <Typography variant="h6">Sala: {room.description}</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          // backgroundColor: "#e5ddd5",
        }}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            sender={message.sender}
            fullname={message.fullname}
            message={message.message}
            isOwnMessage={message.sender === email}
            fileUrl={message.fileUrl}
            fileName={message.fileName}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <TypingIndicator message={typingMessage} />
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #ddd",
          // backgroundColor: "#ffffff",
          borderBottomLeftRadius: "8px", // Add border radius to the bottom corners
          borderBottomRightRadius: "8px",
        }}
      >
        <ChatForm
          onSendMessage={handleMessage}
          onSendFile={handleFileUpload}
          fullname={fullname || "Usuario"}
          room={room}
        />
      </Box>
    </Box>
  );
}

export default function ChatUI() {
  // const user = useSelector((state: AppState) => state.user);

  const [rooms, setRooms] = useState<
    {
      id: string;
      invoiceNumber: string;
      debtorName: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    // Simula la obtención de las salas desde datos locales

    const formattedRooms = InitialInvoices;

    setRooms(formattedRooms);
  }, []);

  const [selectedRoom, setSelectedRoom] = useState<ISelectedRoom>();

  // if (!user) {
  //   return (
  //     <Container maxWidth="lg" sx={{ mt: 5 }}>
  //       <Typography variant="h6" color="textSecondary">
  //         Por favor, inicia sesión para acceder al chat.
  //       </Typography>
  //     </Container>
  //   );
  // }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, display: "flex", height: "80vh" }}>
      <Paper
        elevation={3}
        sx={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #ddd",
            // backgroundColor: "primary.main",
            // color: "#fff",
          }}
        >
          <Typography variant="h6">Salas</Typography>
        </Box>
        <Box sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
          <TextField
            fullWidth
            placeholder="Buscar sala..."
            variant="outlined"
            size="small"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              if (searchTerm === "") {
                // Reset rooms to the original list when the search term is empty
                setRooms(InitialInvoices);
              } else {
                setRooms((prevRooms) =>
                  prevRooms.filter((room) =>
                    room.description.toLowerCase().includes(searchTerm)
                  )
                );
              }
            }}
          />
        </Box>
        <List sx={{ flex: 1, overflowY: "auto" }}>
          {rooms.map((room) => (
            <ListItem key={room.id} disablePadding>
              <ListItemButton
                selected={selectedRoom?.id === room.id}
                onClick={() =>
                  setSelectedRoom({
                    id: room.id,
                    description: room.description,
                  })
                }
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 25,
                    height: 25,
                    mr: 2, // Add some margin to the right of the avatar
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: "0.90rem" }}>
                    {room.debtorName.charAt(0).toUpperCase()}
                  </Typography>
                </Avatar>
                <ListItemText primary={room.description} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          ml: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedRoom ? (
          <ChatWindow
            room={selectedRoom}
            email={""} // user?.email || "
            fullname=""
            // fullname={user?.fullname || "Usuario"}
            // email={user?.email || "Email"}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Selecciona una sala para comenzar a chatear
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
