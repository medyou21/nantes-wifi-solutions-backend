// Import de Zod, bibliothèque de validation et de typage des données
import { z } from "zod";

/**
 * 📥 Schéma de validation pour la connexion (login)
 * Utilisé pour vérifier les données envoyées par l'utilisateur
 */
export const loginSchema = z.object({
  /**
   * 📧 Email utilisateur
   * - obligatoire
   * - doit être un format email valide
   * - converti automatiquement en minuscules
   */
  email: z
    .string({ required_error: "Email requis" }) // champ obligatoire
    .email("Format d'email invalide")           // validation format email
    .toLowerCase(),                             // normalisation

  /**
   * 🔑 Mot de passe utilisateur
   * - obligatoire
   * - longueur minimale et maximale imposée
   */
  password: z
    .string({ required_error: "Mot de passe requis" }) // champ obligatoire
    .min(6, "Mot de passe trop court")                // sécurité minimale
    .max(128, "Mot de passe trop long"),              // limite sécurité
});

/**
 * 🧠 Type TypeScript généré automatiquement depuis le schéma Zod
 * Permet de garder la cohérence entre validation et typage
 */
export type LoginInput = z.infer<typeof loginSchema>;