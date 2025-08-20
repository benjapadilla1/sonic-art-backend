import axios from "axios";
import { Request, Response } from "express";
import { generateAccessToken } from "../utils/generateAccessToken";

export const createOrder = async (req: Request, res: Response) => {
  const { items } = req.body;

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
          return_url: `http://localhost:3001/paypal/capture-order`,
          cancel_url: `http://localhost:3001/paypal/cancel-order`,
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

    res.json({ href: approvalUrl.href });
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error creating PayPal order" });
  }
};

export const captureOrder = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
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
    }
    // TODO: Aquí guardar en Firestore la compra confirmada

    res.json(capture.data);
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error capturing PayPal order" });
  }
};

export const cancelPayment = async (req: Request, res: Response) => {
  try {
    res.json("Payment cancelled");
  } catch (error: any) {
    console.error(error.response?.data ?? error.message);
    res.status(500).json({ error: "Error canceling PayPal order" });
  }
};

export const paypalWebhook = async (req: Request, res: Response) => {
  const event = req.body;

  console.log("Webhook recibido:", event);

  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    // Aquí podrías manejar lógica adicional si querés procesar antes de la captura
  }

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    // TODO: Guardar en Firestore el pago confirmado
  }

  res.sendStatus(200);
};
