import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Contact from "../models/contact.model";
import { generateToken } from "../utils/generateToken";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

/**
 * Contrôleurs du back-office d'administration.
 *
 * Ces handlers sont montés sur des routes protégées (ex: /api/admin/…).
 * L'authentification repose sur un couple email/mot de passe stocké
 * en variables d'environnement, et sur un JWT signé côté serveur.
 */

// ─────────────────────────────────────────────
// 🔐  POST /api/admin/login
// ─────────────────────────────────────────────

/**
 * Authentifie l'administrateur et retourne un JWT.
 *
 * Stratégie : comparaison directe avec les variables d'environnement
 * ADMIN_EMAIL et ADMIN_PASSWORD. Adapté à un admin unique ; pour plusieurs
 * comptes, préférer une collection dédiée avec mots de passe hachés (bcrypt).
 *
 * Réponses :
 *  - 200 + { token }  → identifiants valides
 *  - 401              → email ou mot de passe incorrect
 */
export const adminLogin = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (admin?.active && await bcrypt.compare(String(password), admin.passwordHash)) {
    const token = generateToken({ id: String(admin.id), role: admin.role });
    return res.status(200).json({
      message: "Connexion réussie",
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  }

  return res.status(401).json({ message: "Email ou mot de passe incorrect" });
};

// ─────────────────────────────────────────────
// 📦  GET /api/admin/contacts  (route protégée)
// ─────────────────────────────────────────────

/**
 * Retourne la liste complète des contacts soumis via le formulaire public,
 * triés du plus récent au plus ancien.
 *
 * Cette route doit être précédée du middleware `verifyToken` pour s'assurer
 * que seul un admin authentifié peut y accéder.
 *
 * Le paramètre `_req` est préfixé d'un underscore : convention TypeScript
 * indiquant que la requête entrante n'est pas utilisée dans ce handler.
 *
 * Réponses :
 *  - 200 + tableau de contacts  → succès
 *  - 500                        → erreur base de données
 */
export const getAdminContacts = async (
  _req: Request,
  res: Response
) => {
  try {
    // Récupère tous les documents Contact, du plus récent au plus ancien.
    // `sort({ createdAt: -1 })` exploite l'ordre naturel de MongoDB
    // sur les ObjectId/timestamps pour un tri performant sans index supplémentaire.
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json(contacts);
  } catch (error) {
    // Erreur inattendue (connexion DB perdue, schéma invalide…).
    // On ne renvoie pas le détail de l'erreur au client pour éviter
    // de fuiter des informations sur la structure interne.
    res.status(500).json({
      message: "Erreur récupération contacts",
    });
  }
};

/** Met à jour l'état de traitement d'une demande (UPDATE du CRUD MongoDB). */
export const updateContactStatus = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  const allowedStatuses = ["new", "contacted", "closed"];

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Identifiant de contact invalide" });
  }
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) return res.status(404).json({ message: "Contact introuvable" });
    return res.status(200).json(contact);
  } catch {
    return res.status(500).json({ message: "Erreur lors de la mise à jour du contact" });
  }
};

/** Supprime définitivement une demande (DELETE du CRUD MongoDB). */
export const deleteContact = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Identifiant de contact invalide" });
  }

  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ message: "Contact introuvable" });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Erreur lors de la suppression du contact" });
  }
};
