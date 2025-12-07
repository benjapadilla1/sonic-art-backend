import axios from "axios";
import { Request, Response } from "express";
import admin, { db } from "../config/firebase";
import { generateAccessToken } from "../utils/generateAccessToken";
import { sendOrderNotification } from "./contact.controller";

export const createOrder = async (req: Request, res: Response) => {
  const { items, userId } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userEmail = userDoc.data()?.email;

    const accessToken = await generateAccessToken();

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.price,
      0
    );

    const paypalAPI =
      process.env.PAYPAL_API ||
      (process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com");

    const order = await axios.post(
      `${paypalAPI}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalAmount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/paypal/crear-orden`,
          cancel_url: `${process.env.FRONTEND_URL}/paypal/cancelar-orden`,
          user_action: "PAY_NOW",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const approvalUrl = order.data.links.find(
      (link: any) => link.rel === "approve"
    );

    await db
      .collection("orders")
      .doc(order.data.id)
      .set({
        userId,
        userEmail,
        items,
        amount: totalAmount.toFixed(2),
        currency: "USD",
        status: "CREATED",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ href: approvalUrl.href, id: order.data.id });
    return;
  } catch (error: any) {
    console.error(
      "Error creating PayPal order:",
      error.response?.data ?? error.message
    );
    const errorMessage =
      error.response?.data?.message || "Error creating PayPal order";
    res.status(500).json({ error: errorMessage });
    return;
  }
};

export const captureOrder = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const orderRef = db.collection("orders").doc(token as string);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // If already completed, return success
    if (orderSnap.data()?.status === "COMPLETED") {
      res.json({ success: true, order: orderSnap.data() });
      return;
    }

    const accessToken = await generateAccessToken();

    // Use live API in production, sandbox otherwise
    const paypalAPI =
      process.env.PAYPAL_API ||
      (process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com");

    const capture = await axios.post(
      `${paypalAPI}/v2/checkout/orders/${token}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (capture.data.status === "COMPLETED") {
      const orderData = orderSnap.data();
      const userId = orderData?.userId;
      const items = orderData?.items || [];

      // Update order status
      await orderRef.update({
        status: "COMPLETED",
        captureData: capture.data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user purchase history
      if (userId && items.length > 0) {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          purchaseHistory: admin.firestore.FieldValue.arrayUnion(
            ...items.map((item: any) => ({
              id: item.id,
              type: item.type,
              title: item.title,
              price: item.price,
              purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            }))
          ),
        });
      }

      // Send notification email
      await sendOrderNotification(orderData?.userEmail, token as string, items);
    }

    res.json(capture.data);
  } catch (error: any) {
    console.error(
      "Error capturing PayPal order:",
      error.response?.data ?? error.message
    );
    const errorMessage =
      error.response?.data?.message || "Error capturing PayPal order";
    res.status(500).json({ error: errorMessage });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    if (token) {
      await db
        .collection("orders")
        .doc(token as string)
        .delete();
    }

    console.log("Compra cancelada");
    res.json({ message: "La compra fue cancelada y eliminada." });
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error canceling PayPal order" });
  }
};
