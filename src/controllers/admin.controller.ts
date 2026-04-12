import { Request, Response } from "express";
import Contact from "../models/contact.model";
import { generateToken } from "../utils/generateToken";

// 🔐 LOGIN ADMIN
export const adminLogin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = generateToken(email);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  }

  return res.status(401).json({
    message: "Email ou mot de passe incorrect",
  });
};

// 📦 GET CONTACTS (PROTÉGÉ)
export const getAdminContacts = async (
  _req: Request,
  res: Response
) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération contacts",
    });
  }
};