// Importation du Router d'Express pour créer des routes modulaires
import { Router } from "express";

// Importation des contrôleurs liés à l'administration
import {
  adminLogin,        // Fonction pour connecter un admin
  getAdminContacts,  // Fonction pour récupérer les messages de contact
  updateContactStatus,
  deleteContact,
} from "../controllers/admin.controller";

// Importation du middleware de protection (authentification JWT, session, etc.)
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";
import { authLimiter } from "../config/rateLimit.config";

// Création d'une instance de router Express
const router = Router();

/**
 * Route POST /login
 * Permet à un administrateur de se connecter
 * Accès public (pas de protection nécessaire)
 */
router.post("/login", authLimiter, validate(loginSchema), adminLogin);

/**
 * Route GET /contacts
 * Permet de récupérer la liste des contacts/messages utilisateurs
 * Accès protégé → nécessite authentification via middleware "protect"
 */
router.get("/contacts", protect, getAdminContacts);

/** Mise à jour et suppression protégées : complètent le CRUD des contacts. */
router.patch("/contacts/:id/status", protect, updateContactStatus);
router.delete("/contacts/:id", protect, deleteContact);

/**
 * Export du router admin
 * Permet de l'utiliser dans le fichier principal (app.ts / server.ts)
 */
export default router;
