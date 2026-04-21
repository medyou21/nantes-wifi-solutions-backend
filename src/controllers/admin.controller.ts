import { Request, Response } from "express";
import Contact from "../models/contact.model";
import { generateToken } from "../utils/generateToken";

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
export const adminLogin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Comparaison stricte avec les identifiants définis dans .env.
  // Si ADMIN_EMAIL ou ADMIN_PASSWORD est absent, la condition échouera
  // systématiquement, ce qui constitue un filet de sécurité implicite.
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Génère un JWT signé contenant l'email comme payload.
    // Le token sera fourni par le client dans les requêtes protégées
    // via l'en-tête Authorization: Bearer <token>.
    const token = generateToken(email);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  }

  // Réponse volontairement vague : ne pas distinguer "email inconnu"
  // de "mot de passe incorrect" pour ne pas faciliter l'énumération.
  return res.status(401).json({
    message: "Email ou mot de passe incorrect",
  });
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