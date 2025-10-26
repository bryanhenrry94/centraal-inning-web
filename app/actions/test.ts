"use server";

import EmailService from "@/common/mail/services/emailService";

export const sendTestMail = async () => {
  try {
    // Lógica para enviar correo de prueba
    await EmailService.sendWelcomeEmail("bryanhenrry94@gmail.com", "Bryan");
  } catch (error) {
    throw new Error("Error sending test email:", { cause: error });
  }
};
