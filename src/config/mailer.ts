import nodemailer from "nodemailer";

if (
  !process.env.EMAIL_HOST ||
  !process.env.EMAIL_PORT ||
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS
) {
  console.error("Error: Missing email configuration in environment variables");
  console.error("Required: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS");
} else {
  console.log("Email config loaded:");
  console.log("HOST:", process.env.EMAIL_HOST);
  console.log("PORT:", process.env.EMAIL_PORT);
  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS length:", process.env.EMAIL_PASS?.length, "chars");
  console.log("PASS has spaces:", process.env.EMAIL_PASS?.includes(" "));
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});
