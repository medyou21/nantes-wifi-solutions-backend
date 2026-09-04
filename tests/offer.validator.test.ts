import { describe, expect, it } from "vitest";
import { createOfferSchema, updateOfferSchema } from "../src/validators/offer.validator";

describe("validation des offres SQL", () => {
  it("normalise un prix reçu sous forme de chaîne", () => {
    const result = createOfferSchema.parse({
      title: "Basic", price: "79", description: "Diagnostic Wi-Fi complet",
      features: ["Audit du signal"], serviceSlug: "diagnostic",
    });
    expect(result.price).toBe(79);
  });

  it("rejette une mise à jour vide ou un prix négatif", () => {
    expect(updateOfferSchema.safeParse({}).success).toBe(false);
    expect(updateOfferSchema.safeParse({ price: -1 }).success).toBe(false);
  });
});
