// Importation du Router Express pour définir les routes
import { Router } from "express";

// Importation du contrôleur qui gère la création d'un contact
import { createContact } from "../controllers/contact.controller";

// Middleware de validation des données entrantes (body request)
import { validate } from "../middlewares/validate.middleware";

// Schéma de validation des données du formulaire contact (Zod / Joi / Yup)
import { contactSchema } from "../validators/contact.validator";

// Middleware de limitation de requêtes pour éviter le spam
import { contactLimiter } from "../config/rateLimit.config";

// Création d'une instance de routeur Express
const router = Router();

/**
 * Route POST /
 * Permet d'envoyer un message de contact (formulaire utilisateur)
 *
 * Ordre des middlewares :
 *
 * 1. contactLimiter → limite le nombre d'envois (anti-spam / abuse)
 * 2. validate(contactSchema) → vérifie et nettoie les données envoyées
 * 3. createContact → enregistre le message en base de données
 */
router.post(
  "/",
  contactLimiter,          // 🔒 Protection anti-spam (ex: 5 requêtes / heure / IP)
  validate(contactSchema), // ✅ Validation + sanitation des données
  createContact            // 💾 Sauvegarde du message en base MongoDB
);

/**
 * Export du router contact
 * Utilisé dans le fichier principal (app.ts / server.ts)
 */
export default router;