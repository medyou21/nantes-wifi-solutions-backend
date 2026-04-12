import { Request, Response } from 'express';
import Contact from '../models/contact.model';
import { sendAdminMail, sendClientMail } from '../services/mail.service';

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Envoi des emails sans bloquer la réponse
    await Promise.all([
      sendAdminMail(contact),
      sendClientMail(contact),
    ]);

    res.status(201).json({
      message: 'Demande envoyée avec succès.',
      contact,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi.',
    });
  }
};

export const getContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json(contacts);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la récupération.',
    });
  }
};