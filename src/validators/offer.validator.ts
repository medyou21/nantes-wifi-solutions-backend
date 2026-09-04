import { z } from "zod";

const offerFields = {
  title: z.string().trim().min(2).max(80),
  price: z.coerce.number().positive().max(100000),
  description: z.string().trim().min(10).max(1000),
  features: z.array(z.string().trim().min(1).max(160)).min(1).max(20),
  highlighted: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(100).default(0),
  active: z.boolean().default(true),
  serviceSlug: z.string().trim().min(2).max(80),
};

/** Validation stricte des données administrables stockées dans PostgreSQL. */
export const createOfferSchema = z.object(offerFields).strict();

export const updateOfferSchema = z.object({
  ...offerFields,
  highlighted: offerFields.highlighted.optional(),
  displayOrder: offerFields.displayOrder.optional(),
  active: offerFields.active.optional(),
}).partial().strict().refine((value) => Object.keys(value).length > 0, {
  message: "Au moins un champ doit être fourni",
});
