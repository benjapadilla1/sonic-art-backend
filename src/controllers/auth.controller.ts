import axios from "axios";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { transporter } from "../config/mailer";
import { verifyCaptcha } from "../middlewares/verifyCaptcha";

interface FirebaseAuthResponse {
  idToken: string;
  localId: string;
}

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const resetLink = await getAuth().generatePasswordResetLink(email);

    await transporter.sendMail({
      from: `"Soporte SonicArt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recupera tu contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}" style="color: #4f46e5; font-weight: bold;">Restablecer contraseña</a>
        <br /><br />
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
    });

    return res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password, captcha } = req.body;

  const isHuman = await verifyCaptcha(captcha);

  if (!isHuman) {
    return res.status(400).json({ error: "Captcha verification failed" });
  }

  try {
    const { data } = await axios.post<FirebaseAuthResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return res.json({ token: data.idToken, userId: data.localId });
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(401).json({ error: "Credenciales inválidas" });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {};
