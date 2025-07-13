import axios from "axios";
import { Request, Response } from "express";

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const { data } = await axios.post(
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

export const register = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return res.status(201).json({ token: data.idToken, userId: data.localId });
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(400).json({ error: "No se pudo registrar el usuario" });
  }
};
