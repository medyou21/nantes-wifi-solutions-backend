// Importation du Router d'Express pour créer des routes modulaires
import { Router } from "express";

// Importation du contrôleur d'authentification (login utilisateur/admin)
import { login } from "../controllers/auth.controller";

// Middleware de validation des données (ex: body request)
import { validate } from "../middlewares/validate.middleware";

// Schéma de validation (Joi / Zod / Yup selon ton implémentation)
import { loginSchema } from "../validators/auth.validator";

// Middleware de limitation de requêtes (anti brute force / sécurité)
import { authLimiter } from "../config/rateLimit.config";

// Création du routeur Express
const router = Router();

/**
 * Route POST /login
 * Permet à un utilisateur de se connecter
 *
 * Ordre d'exécution des middlewares :
 *
 * 1. authLimiter → limite le nombre de tentatives (sécurité brute force)
 * 2. validate(loginSchema) → vérifie que les données envoyées sont valides
 * 3. login → traitement de la connexion (authentification)
 */
router.post(
  "/login",
  authLimiter,           // 🔒 Protection contre les attaques par force brute
  validate(loginSchema), // ✅ Validation des champs (email, password, etc.)
  login                  // 🔑 Contrôleur de connexion
);

/**
 * Export du router d'authentification
 * Utilisé dans le fichier principal (app.ts / server.ts)
 */
export default router;