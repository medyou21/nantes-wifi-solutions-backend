import { z } from "zod";

// ── Helpers ───────────────────────────────────
const stripHtml = (val: string) =>
  val.replace(/<[^>]*>/g, "").trim();

// ── Schema ────────────────────────────────────
export const contactSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long")
    .transform(stripHtml),

  email: z
    .string({ required_error: "L'email est requis" })
    .email("Format d'email invalide")
    .max(254, "Email trop long")
    .toLowerCase(),

  phone: z
    .string()
    .optional()
    .transform((val) => val?.replace(/[^\d\s\+\-\.\(\)]/g, "").trim())
    .refine(
      (val) => !val || /^[\d\s\+\-\.\(\)]{7,20}$/.test(val),
      "Numéro de téléphone invalide"
    ),

  service: z
    .enum(
      ["diagnostic", "installation", "securite", "reseau", "maintenance"],
      { errorMap: () => ({ message: "Service invalide" }) }
    )
    .optional(),

  message: z
    .string({ required_error: "Le message est requis" })
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message est trop long (2000 caractères max)")
    .transform(stripHtml),
});

export type ContactInput = z.infer<typeof contactSchema>;