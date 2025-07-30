import { Request, Response } from "express";
import { transporter } from "../config/mailer";

export const sendContactEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { message, name, email } = req.body;
  try {
    await transporter.sendMail({
      from: `"Contacto Web" <${email}>`,
      to: "tucorreo@tudominio.com",
      subject: "Nuevo mensaje desde el formulario de contacto",
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({ message: "Email enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar email:", error);
    return res.status(500).json({ error: "No se ha podido enviar el mail" });
  }
};
