import nodemailer from "nodemailer";
import { IContact } from "../models/contact.model";

// ─────────────────────────────────────────────
// TRANSPORTER
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérification SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP error:", error);
  } else {
    console.log("✅ SMTP prêt");
  }
});

// ─────────────────────────────────────────────
// EMAIL ADMIN
// ─────────────────────────────────────────────
export const sendAdminMail = async (contact: IContact): Promise<void> => {
  try {
    if (!process.env.MAIL_TO) {
      throw new Error("MAIL_TO non défini dans .env");
    }

    await transporter.sendMail({
      from: `"Nantes WiFi Solutions" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      subject: `📬 Nouvelle demande - ${contact.name}`,
      html: `
        <h2>Nouvelle demande de contact</h2>
        <p><strong>Nom :</strong> ${contact.name}</p>
        <p><strong>Email :</strong> ${contact.email}</p>
        <p><strong>Téléphone :</strong> ${contact.phone || "Non renseigné"}</p>
        <p><strong>Entreprise :</strong> ${contact.company || "Non renseignée"}</p>
        <p><strong>Service :</strong> ${contact.service || "Non spécifié"}</p>
        <p><strong>Message :</strong></p>
        <p>${contact.message}</p>
      `,
    });

    console.log("📩 Email admin envoyé");

  } catch (error) {
    console.error("❌ Erreur envoi mail admin:", error);
  }
};

// ─────────────────────────────────────────────
// EMAIL CLIENT
// ─────────────────────────────────────────────
export const sendClientMail = async (contact: IContact): Promise<void> => {
  try {
    if (!contact.email) {
      console.error("❌ Email client manquant");
      return;
    }

    await transporter.sendMail({
      from: `"Nantes WiFi Solutions" <${process.env.MAIL_FROM}>`,
      to: contact.email,
      subject: "✅ Demande reçue",
      html: `
        <h2>Bonjour ${contact.name},</h2>
        <p>Merci pour votre demande 🙌</p>
        <p>Nous allons vous répondre très rapidement.</p>
        <br>
        <p><strong>Nantes WiFi Solutions</strong></p>
      `,
    });

    console.log("📩 Email client envoyé");

  } catch (error) {
    console.error("❌ Erreur envoi mail client:", error);
  }
};