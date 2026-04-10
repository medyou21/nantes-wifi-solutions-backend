import nodemailer from 'nodemailer';
import { IContact } from '../models/contact.model';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAdminMail = async (contact: IContact): Promise<void> => {
  await transporter.sendMail({
    from: `"Nantes WiFi Solutions" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📬 Nouvelle demande de contact - ${contact.name}`,
    html: `
      <h2>Nouvelle demande de contact</h2>
      <p><strong>Nom :</strong> ${contact.name}</p>
      <p><strong>Email :</strong> ${contact.email}</p>
      <p><strong>Téléphone :</strong> ${contact.phone || 'Non renseigné'}</p>
      <p><strong>Entreprise :</strong> ${contact.company || 'Non renseignée'}</p>
      <p><strong>Message :</strong></p>
      <p>${contact.message}</p>
    `,
  });
};

export const sendClientMail = async (contact: IContact): Promise<void> => {
  await transporter.sendMail({
    from: `"Nantes WiFi Solutions" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject: '✅ Votre demande a bien été reçue',
    html: `
      <h2>Bonjour ${contact.name},</h2>
      <p>Merci pour votre message. Notre équipe reviendra vers vous dans les plus brefs délais.</p>
      <br>
      <p>Cordialement,</p>
      <p><strong>L'équipe Nantes WiFi Solutions</strong></p>
    `,
  });
};
