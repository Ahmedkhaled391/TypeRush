import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendVerificationEmail({ email, username, code }) {
  const smtp = getTransporter();
  if (!smtp) {
    console.log(`[mail:skip] No SMTP config. Verification code for ${email}: ${code}`);
    return;
  }

  await smtp.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: "TypeRush verification code",
    html: `<p>Hi ${username},</p><p>Your TypeRush verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes.</p>`,
  });
}
