import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: env.NODE_ENV === "production",
    },
  });
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
