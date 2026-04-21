// Importation du Router d'Express pour créer des routes modulaires
import { Router } from "express";

// Importation des contrôleurs liés à l'administration
import {
  adminLogin,        // Fonction pour connecter un admin
  getAdminContacts,  // Fonction pour récupérer les messages de contact
} from "../controllers/admin.controller";

// Importation du middleware de protection (authentification JWT, session, etc.)
import { protect } from "../middlewares/auth.middleware";

// Création d'une instance de router Express
const router = Router();

/**
 * Route POST /login
 * Permet à un administrateur de se connecter
 * Accès public (pas de protection nécessaire)
 */
router.post("/login", adminLogin);

/**
 * Route GET /contacts
 * Permet de récupérer la liste des contacts/messages utilisateurs
 * Accès protégé → nécessite authentification via middleware "protect"
 */
router.get("/contacts", protect, getAdminContacts);

/**
 * Export du router admin
 * Permet de l'utiliser dans le fichier principal (app.ts / server.ts)
 */
export default router;