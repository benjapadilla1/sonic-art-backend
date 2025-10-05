import axios from "axios";
import { Request, Response } from "express";
import admin, { db } from "../config/firebase";
import { generateAccessToken } from "../utils/generateAccessToken";
import { sendOrderNotification } from "./contact.controller";

export const createOrder = async (req: Request, res: Response) => {
  const { items, userId } = req.body;

  try {
    const accessToken = await generateAccessToken();

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.price,
      0
    );

    const order = await axios.post(
      `${process.env.PAYPAL_API}/v2/checkout/orders`,
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
        items,
        amount: totalAmount.toFixed(2),
        currency: "USD",
        status: "CREATED",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ href: approvalUrl.href, id: order.data.id });
    return;
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error creating PayPal order" });
    return;
  }
};

export const captureOrder = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const orderRef = db.collection("orders").doc(token as string);
    const orderSnap = await orderRef.get();

    if (orderSnap.exists && orderSnap.data()?.status === "COMPLETED") {
      res.json({ success: true, order: orderSnap.data() });
      return;
    }

    const accessToken = await generateAccessToken();
    const capture = await axios.post(
      `${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (capture.data.status === "COMPLETED") {
      await orderRef.update({
        status: "COMPLETED",
        captureData: capture.data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await sendOrderNotification(
      orderSnap.data()?.userEmail,
      token as string,
      orderSnap.data()?.items || []
    );

    res.json(capture.data);
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error capturing PayPal order" });
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
