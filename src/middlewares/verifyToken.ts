import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase";

export type AuthenticatedRequest = Request & {
  user?: {
    uid: string;
    isAdmin?: boolean;
    email?: string;
  };
};

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").where("uid", "==", uid).get();

    if (userDoc.empty) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    req.user = {
      uid,
      isAdmin: true,
      email: decodedToken.email,
    };

    next();
    return;
  } catch (error) {
    console.error("Error verificando token:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
    return;
  }
};
