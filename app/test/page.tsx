"use client";
import { Button } from "@mui/material";
import { notifyInfo } from "@/lib/notifications";
import { sendTestMail } from "../actions/test";

const TestPage = () => {
  const handleTestMail = async () => {
    try {
      // Lógica para enviar correo de prueba
      await sendTestMail();
      notifyInfo("Correo de prueba enviado");
    } catch (error) {
      console.error("Error sending test email:", error);
      notifyInfo("Error sending test email");
    }
  };

  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page.</p>

      <Button variant="contained" color="primary" onClick={handleTestMail}>
        Test Mail
      </Button>
    </div>
  );
};
export default TestPage;
