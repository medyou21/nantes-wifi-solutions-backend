import { Request, Response } from "express";
import Contact from "../models/contact.model";
import { sendAdminMail, sendClientMail } from "../services/mail.service";

// ─────────────────────────────────────────────
// CREATE CONTACT
// ─────────────────────────────────────────────
export const createContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contact = new Contact(req.body);

    const saved = await contact.save();

    // 🔥 Toujours renvoyer des dates ISO propres
    const formatted = {
      ...saved.toObject(),
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };

    // Emails async (non bloquant)
    Promise.all([
      sendAdminMail(saved),
      sendClientMail(saved),
    ]).catch(console.error);

    res.status(201).json({
      message: "Demande envoyée avec succès.",
      contact: formatted,
    });

  } catch (error) {
    console.error("❌ createContact:", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi.",
    });
  }
};

// ─────────────────────────────────────────────
// GET CONTACTS
// ─────────────────────────────────────────────
export const getContacts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean(); // 🔥 important (JSON propre)

    // 🔥 Fix dates
    const formattedContacts = contacts.map((c) => ({
      ...c,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toISOString()
        : null,
      updatedAt: c.updatedAt
        ? new Date(c.updatedAt).toISOString()
        : null,
    }));

    res.status(200).json(formattedContacts);

  } catch (error) {
    console.error("❌ getContacts:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération.",
    });
  }
};