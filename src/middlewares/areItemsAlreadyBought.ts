import { NextFunction, Request, Response } from "express";
import { db } from "../config/firebase";

export const areItemsAlreadyBought = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, userId } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }

    const snapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      return next();
    }

    const purchasedItemIds = snapshot.docs.flatMap(
      (doc) => doc.data().items || []
    );

    const alreadyBought = items.find((item: any) =>
      purchasedItemIds.some((purchased: any) => purchased.id === item.id)
    );

    if (alreadyBought) {
      res.status(409).json({
        error: `El item "${alreadyBought.name}" ya fue comprado por este usuario.`,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error verificando compras previas:", error);
    res.status(500).json({ error: "Error al verificar compras previas" });
  }
};
