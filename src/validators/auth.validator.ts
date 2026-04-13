import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email requis" })
    .email("Format d'email invalide")
    .toLowerCase(),

  password: z
    .string({ required_error: "Mot de passe requis" })
    .min(6, "Mot de passe trop court")
    .max(128, "Mot de passe trop long"),
});

export type LoginInput = z.infer<typeof loginSchema>;