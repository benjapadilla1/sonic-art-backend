import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase";
import { AuthenticatedRequest } from "../middlewares/verifyToken";
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
        provider: data.provider ?? "email",
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

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string
) => {
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
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

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { displayName } = req.body;

    const snapshot = await usersCollection.where("uid", "==", uid).get();

    if (!snapshot.empty) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    await snapshot.docs[0].ref.update({
      displayName,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ message: "User updated successfully" });
    return;
  } catch (error) {
    console.log("Error updating the user profile", error);
    return;
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
