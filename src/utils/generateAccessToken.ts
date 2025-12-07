import axios from "axios";

export const generateAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const paypalAPI =
      process.env.PAYPAL_API ||
      (process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com");

    const response = await axios.post(`${paypalAPI}/v1/oauth2/token`, params, {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID ?? "",
        password: process.env.PAYPAL_SECRET_KEY ?? "",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "Error generando token PayPal:",
      error.response?.data ?? error.message
    );
    throw error;
  }
};
