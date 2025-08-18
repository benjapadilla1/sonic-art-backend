import axios from "axios";

export const generateAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const response = await axios.post(
      `${process.env.PAYPAL_API}/v1/oauth2/token`,
      params,
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID ?? "",
          password: process.env.PAYPAL_SECRET_KEY ?? "",
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "Error generando token PayPal:",
      error.response?.data ?? error.message
    );
    throw error;
  }
};
