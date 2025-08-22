import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase";
import { AuthenticatedRequest } from "../middlewares/requireAdmin";
import { UserProfile } from "../models/firestore";

const usersCollection = db.collection("users");

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const snapshot = await usersCollection.get();
    const users: UserProfile[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      users.push({
        uid: doc.id,
        email: data.email,
        isAdmin: data.isAdmin,
        purchaseHistory: data.purchaseHistory || [],
        createdAt: data.createdAt?.toDate().toISOString() ?? null,
      });
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { uid } = req.params;

  try {
    const userDoc = await usersCollection.doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      uid: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const createUserProfile = async (uid: string, email: string) => {
  const userProfile: UserProfile = {
    uid,
    email,
    isAdmin: false,
    purchaseHistory: [],
    createdAt: admin.firestore.Timestamp.now(),
  };

  try {
    await usersCollection.doc(uid).set(userProfile);
  } catch (error) {
    console.error("Error creando perfil de usuario:", error);
  }
};

export const getUserFromToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const uid = req.user?.uid;

  if (!uid) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  try {
    const userDoc = await usersCollection.doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ uid: userDoc.id, ...userDoc.data() });
    return;
  } catch (error) {
    console.error("Error verificando si el usuario es admin:", error);
    res.status(500).json({ message: "Error del servidor" });
    return;
  }
};
