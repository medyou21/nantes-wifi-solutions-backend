// Import de Zod (validation + typage runtime)
import { z } from "zod";

/**
 * 🧼 Fonction utilitaire
 * Supprime les balises HTML pour éviter les injections (XSS basique)
 */
const stripHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

/**
 * 📌 Liste des services autorisés
 * Utilisée pour limiter les valeurs possibles côté backend
 */
const SERVICE_LABELS = [
  "Diagnostic Wi-Fi",
  "Installation Wi-Fi",
  "Sécurité & Surveillance",
  "Réseau professionnel",
  "Autre",
] as const;

/**
 * 📩 Schéma de validation du formulaire de contact
 * Sécurise et normalise les données envoyées par l'utilisateur
 */
export const contactSchema = z.object({
  /**
   * 👤 Nom de l'utilisateur
   * - obligatoire
   * - longueur contrôlée
   * - nettoyage HTML (anti injection simple)
   */
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long")
    .transform(stripHtml),

  /**
   * 📧 Email utilisateur
   * - obligatoire
   * - format email valide
   * - normalisé en minuscules
   */
  email: z
    .string({ required_error: "L'email est requis" })
    .email("Format d'email invalide")
    .max(254, "Email trop long")
    .toLowerCase(),

  /**
   * 📞 Téléphone (optionnel)
   * - nettoyage des caractères non autorisés
   * - validation format léger
   */
  phone: z
    .string()
    .optional()
    .transform((val) =>
      val?.replace(/[^\d\s\+\-\.\(\)]/g, "").trim()
    )
    .refine(
      (val) =>
        !val || /^[\d\s\+\-\.\(\)]{7,20}$/.test(val),
      "Numéro de téléphone invalide"
    ),

  /**
   * 🧠 Service demandé
   * - valeur limitée à une liste prédéfinie
   * - fallback automatique sur "Autre"
   */
  service: z
    .enum(SERVICE_LABELS, {
      errorMap: () => ({ message: "Service invalide" }),
    })
    .optional()
    .default("Autre"),

  /**
   * 💬 Message utilisateur
   * - obligatoire
   * - longueur contrôlée
   * - nettoyage HTML (anti injection)
   */
  message: z
    .string({ required_error: "Le message est requis" })
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message est trop long (2000 caractères max)")
    .transform(stripHtml),
});

/**
 * 🧠 Type TypeScript généré automatiquement depuis le schéma
 * Garantit cohérence entre validation runtime et typage compile-time
 */
export type ContactInput = z.infer<typeof contactSchema>;