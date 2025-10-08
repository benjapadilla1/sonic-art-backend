import { Request, Response } from "express";
import { transporter } from "../config/mailer";

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendContactEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { message, name, email } = req.body;
  try {
    await transporter.sendMail({
      from: `"Contacto Web" <info@sonicartlab.com>`,
      to: "info@sonicartlab.com",
      replyTo: email,
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

export const sendOrderNotificationController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userEmail, orderId, orderItems } = req.body;

  try {
    interface OrderItem {
      name: string;
      price: number;
      quantity: number;
    }

    const orderItemsTyped: OrderItem[] = orderItems;

    const itemsHtml = orderItemsTyped
      .map(
        (item: OrderItem) => `
        <li>
        ${item.quantity}x ${item.name} - $${item.price * item.quantity}
        </li>`
      )
      .join("");

    const mailOptions: SendMailOptions = {
      from: `"SonicArt" <info@sonicartlab.com>`,
      to: userEmail,
      subject: `Detalles de tu pedido ${orderId}`,
      text: `Gracias por tu compra. Tu pedido ${orderId} contiene:\n${orderItems
        .map(
          (i: OrderItem) =>
            `${i.quantity}x ${i.name} - $${i.price * i.quantity}`
        )
        .join("\n")}`,
      html: `
      <h2>¡Gracias por tu compra en SonicArt!</h2>
      <p><strong>ID de pedido:</strong> ${orderId}</p>
      <p><strong>Detalles de tu pedido:</strong></p>
      <ul>
        ${itemsHtml}
      </ul>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar notificación de pedido:", error);
    return res
      .status(500)
      .json({ error: "No se ha podido enviar la notificación de pedido" });
  }
};

export const sendOrderNotification = async (
  userEmail: string,
  orderId: string,
  orderItems: Array<{ name: string; price: number; quantity: number }>
) => {
  console.log(orderItems);
  try {
    const itemsHtml = orderItems
      .map(
        (item) => `
          <li>
            ${item.quantity}x ${item.name} - $${item.price * item.quantity}
          </li>`
      )
      .join("");

    await transporter.sendMail({
      from: `"SonicArt" <info@sonicartlab.com>`,
      to: userEmail,
      subject: `Detalles de tu pedido ${orderId}`,
      text: `Gracias por tu compra. Tu pedido ${orderId} contiene:\n${orderItems
        .map((i) => `${i.quantity}x ${i.name} - $${i.price * i.quantity}`)
        .join("\n")}`,
      html: `
        <h2>¡Gracias por tu compra en SonicArt!</h2>
        <p><strong>ID de pedido:</strong> ${orderId}</p>
        <p><strong>Detalles de tu pedido:</strong></p>
        <ul>
          ${itemsHtml}
        </ul>
        <p>Nos comunicaremos contigo si hay novedades sobre tu pedido.</p>
      `,
    });
  } catch (error) {
    console.error("Error al enviar notificación de pedido:", error);
  }
};
