import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Helpers for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendLinkTemplates = new Set([
  "send-token",
  "verify-registration",
  "verify-token",
]);

let transporter;

function getMailAuth() {
  const user = process.env.MAIL_USERNAME?.trim();
  const pass = process.env.MAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error("MAIL_USERNAME and MAIL_PASSWORD are required to send email");
  }

  return { user, pass };
}

function getTransportConfig() {
  const auth = getMailAuth();
  const host = process.env.MAIL_HOST?.trim();

  if (host) {
    const port = Number(process.env.MAIL_PORT || 587);

    return {
      host,
      port,
      secure: process.env.MAIL_SECURE === "true" || port === 465,
      auth,
    };
  }

  return {
    service: process.env.MAIL_SERVICE || "yahoo",
    auth,
  };
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(getTransportConfig());
  }

  return transporter;
}

function normalizeBaseUrl(baseUrl) {
  return `${baseUrl.trim().replace(/\/+$/, "")}/`;
}

function getFrontendBaseUrl() {
  const baseUrl = process.env.FRONTEND_BASE_URL;

  if (!baseUrl?.trim()) {
    throw new Error("FRONTEND_BASE_URL is required for frontend email links");
  }

  return normalizeBaseUrl(baseUrl);
}

async function inlineLocalStylesheets(html) {
  const stylesheetPattern =
    /<link\s+rel=["']stylesheet["']\s+href=["']\.\/([^"']+\.css)["']\s*\/?>/gi;
  const stylesheets = [...html.matchAll(stylesheetPattern)];
  let htmlWithInlineStyles = html;

  for (const [linkTag, cssFileName] of stylesheets) {
    const cssPath = path.join(__dirname, "templates", path.basename(cssFileName));
    const cssContent = await fs.readFile(cssPath, "utf8");
    htmlWithInlineStyles = htmlWithInlineStyles.replace(
      linkTag,
      `<style>\n${cssContent}\n</style>`
    );
  }

  return htmlWithInlineStyles;
}

async function renderTemplate(templateName, data) {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);
  const htmlContent = await ejs.renderFile(templatePath, data);
  return inlineLocalStylesheets(htmlContent);
}

async function sendTemplateEmail({ To, Subject, templateName, Data = {} }) {
  if (!To || !Subject) {
    throw new Error("Email recipient and subject are required");
  }

  const templateData = { ...Data };

  if (frontendLinkTemplates.has(templateName)) {
    templateData.frontendBaseUrl = getFrontendBaseUrl();
  } else if (process.env.FRONTEND_BASE_URL?.trim()) {
    templateData.frontendBaseUrl = normalizeBaseUrl(process.env.FRONTEND_BASE_URL);
  }

  const htmlContent = await renderTemplate(templateName, templateData);

  const from = process.env.MAIL_FROM || process.env.MAIL_USERNAME;
  try {
    const info = await getTransporter().sendMail({
      from,
      to: To,
      subject: Subject,
      html: htmlContent,
    });
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
