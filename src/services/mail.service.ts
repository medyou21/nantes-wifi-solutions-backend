// Import du modèle Contact (TypeScript interface)
import { IContact } from "../models/contact.model";

// Service de génération du devis PDF
import { generateDevisPDF, DevisInput } from "./pdf.service";

/**
 * ─────────────────────────────────────────────
 * 📧 BREVO API (service d'envoi d'emails)
 * Supporte les pièces jointes (PDF)
 * ─────────────────────────────────────────────
 */
const BREVO_API = "https://api.brevo.com/v3/smtp/email";

/**
 * Fonction générique d'envoi d'email via Brevo API
 * Centralise l'appel HTTP + gestion d'erreur
 */
async function sendBrevoMail(payload: object): Promise<void> {
  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY ?? "", // clé API Brevo
    },
    body: JSON.stringify(payload),
  });

  // Vérification du succès de l'envoi
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${err}`);
  }
}

/**
 * ─────────────────────────────────────────────
 * 🧾 Génération du numéro de devis unique
 * Format : DEV-YYYYMM-XXXX
 * ─────────────────────────────────────────────
 */
function makeDevisNum(): string {
  const now = new Date();

  const yymm = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const rand = Math.floor(1000 + Math.random() * 9000);

  return `DEV-${yymm}-${rand}`;
}

/**
 * ─────────────────────────────────────────────
 * 📩 EMAIL ADMIN (notification interne)
 * Envoie un mail + PDF au responsable
 * ─────────────────────────────────────────────
 */
export const sendAdminMail = async (
  contact: IContact,
  pdfBuffer: Buffer,
  devisNum: string
): Promise<void> => {
  try {
    if (!process.env.MAIL_TO) {
      throw new Error("MAIL_TO non défini");
    }

    await sendBrevoMail({
      sender: {
        name: "Nantes WiFi Solutions",
        email: process.env.MAIL_FROM,
      },

      to: [{ email: process.env.MAIL_TO }],

      subject: `📬 Nouveau lead — ${contact.name} (${contact.service ?? "N/A"})`,

      htmlContent: `
        <h2>Nouvelle demande de contact</h2>

        <p><strong>Nom :</strong> ${contact.name}</p>
        <p><strong>Email :</strong> ${contact.email}</p>
        <p><strong>Téléphone :</strong> ${contact.phone ?? "—"}</p>
        <p><strong>Service :</strong> ${contact.service ?? "—"}</p>

        <p><strong>Message :</strong><br/>${contact.message}</p>

        <p><strong>Devis N° :</strong> ${devisNum}</p>
      `,

      // Pièce jointe PDF encodée en base64
      attachment: [
        {
          name: `devis_${devisNum}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log("📩 Email admin envoyé avec PDF");
  } catch (err) {
    console.error("❌ Erreur mail admin:", err);
  }
};

/**
 * ─────────────────────────────────────────────
 * 📩 EMAIL CLIENT (confirmation utilisateur)
 * Envoie le devis PDF au client
 * ─────────────────────────────────────────────
 */
export const sendClientMail = async (
  contact: IContact,
  pdfBuffer: Buffer,
  devisNum: string
): Promise<void> => {
  try {
    // Sécurité : vérification email client
    if (!contact.email) {
      console.error("❌ Email client manquant");
      return;
    }

    await sendBrevoMail({
      sender: {
        name: "Nantes WiFi Solutions",
        email: process.env.MAIL_FROM,
      },

      to: [
        {
          email: contact.email,
          name: contact.name,
        },
      ],

      subject: `✅ Votre devis ${devisNum} — Nantes WiFi Solutions`,

      htmlContent: `
        <h2>Bonjour ${contact.name},</h2>

        <p>
          Merci pour votre demande concernant :
          <strong>${contact.service ?? "nos services Wi-Fi"}</strong>.
        </p>

        <p>
          Veuillez trouver ci-joint votre devis
          <strong>${devisNum}</strong>.
        </p>

        <p>
          Notre équipe vous recontactera sous <strong>2h</strong>.
        </p>

        <br/>

        <p>
          Cordialement,<br/>
          <strong>Nantes WiFi Solutions</strong><br/>
          06 12 34 55 78 — contact@nantes-wifi-solutions.fr
        </p>
      `,

      attachment: [
        {
          name: `devis_${devisNum}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log("📩 Email client envoyé avec PDF");
  } catch (err) {
    console.error("❌ Erreur mail client:", err);
  }
};

/**
 * ─────────────────────────────────────────────
 * 🚀 ORCHESTRATEUR PRINCIPAL
 * - Génère numéro de devis
 * - Génère PDF
 * - Envoie email admin + client en parallèle
 * ─────────────────────────────────────────────
 */
export const sendDevisMails = async (
  contact: IContact
): Promise<void> => {
  const devisNum = makeDevisNum();

  console.log("[DEVIS] service :", contact.service);
  console.log("[DEVIS] numéro   :", devisNum);

  // Données utilisées pour générer le PDF
  const devisInput: DevisInput = {
    clientName: contact.name,
    clientEmail: contact.email,
    clientPhone: contact.phone ?? "",
    service: contact.service ?? "Diagnostic Wi-Fi",
    message: contact.message ?? "",
    devisNum,
  };

  let pdfBuffer: Buffer;

  try {
    // Génération du PDF
    pdfBuffer = await generateDevisPDF(devisInput);

    console.log("[PDF] Généré - taille :", pdfBuffer.length, "bytes");
  } catch (err) {
    console.error("❌ Génération PDF échouée :", err);
    return;
  }

  // Envoi parallèle des emails (gain de performance)
  await Promise.all([
    sendAdminMail(contact, pdfBuffer, devisNum),
    sendClientMail(contact, pdfBuffer, devisNum),
  ]);
};