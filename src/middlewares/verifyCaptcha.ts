import axios from "axios";

export const verifyCaptcha = async (token: string) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret,
        response: token,
      },
    }
  );

  return res.data.success;
};
