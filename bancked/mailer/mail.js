// mailService.js
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// Helpers for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function renderTemplate(templateName, data) {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);
  return await ejs.renderFile(templatePath, data);
}

async function sendTemplateEmail({ To, Subject, templateName, Data }) {
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL ?? "http://119.82.68.149/festival/";

  const htmlContent = await renderTemplate(templateName, {
    ...Data,
    // frontendBaseUrl,
  });

  // const from = process.env.MAIL_FROM_ADDRESS;
  const from = `'URL SHORTENER' < ${testAccount.user}>`;
  try {
    const info = await transporter.sendMail({
      from,
      to: To,
      subject: Subject,
      html: htmlContent,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error(`Error sending '${templateName}' email:`, error);
    throw error;
  }
}

export const Mail = {
  registerMail: async (mailContent) =>
    sendTemplateEmail({ ...mailContent, templateName: "send-token" }),

  accountActivationMail: async (mailContent) =>
    sendTemplateEmail({ ...mailContent, templateName: "verify-token" }),

  sendOtp: async (mailContent) =>
    sendTemplateEmail({ ...mailContent, templateName: "send-otp" }),

  resetPasswordMail: async (mailContent) =>
    sendTemplateEmail({ ...mailContent, templateName: "reset-password" }),
};
