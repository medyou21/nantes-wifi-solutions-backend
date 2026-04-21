import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Factory de middleware de validation Express basée sur Zod.
 *
 * Retourne un middleware qui valide et transforme `req.body`
 * selon le schéma Zod fourni, avant que la requête n'atteigne le handler.
 *
 * Double rôle :
 *  - **Validation**   → rejette les données non conformes avec un 422 explicite.
 *  - **Transformation** → applique les `.transform()` définis dans le schéma
 *                         (trim, normalisation, cast de types…) directement
 *                         sur `req.body`, garantissant des données propres en aval.
 *
 * Utilisation :
 * @example
 * router.post("/contact", validate(contactSchema), createContact);
 *
 * @param schema - Schéma Zod décrivant la forme et les contraintes attendues de `req.body`
 * @returns      Middleware Express `(req, res, next) => void`
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // `schema.parse` effectue deux opérations en une :
      //  1. Valide `req.body` contre le schéma (types, contraintes, champs requis…).
      //  2. Retourne la valeur transformée si des `.transform()` sont définis
      //     (ex: `.trim()`, `.toLowerCase()`, cast `string → number`…).
      // On réaffecte le résultat à `req.body` pour que les handlers en aval
      // reçoivent des données déjà nettoyées et normalisées.
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // ZodError contient un tableau `errors` décrivant chaque champ invalide.
        // On le reformate en une structure claire et exploitable côté client :
        //  - `field`   : chemin vers le champ fautif (ex: "adresse.codePostal"
        //                pour un objet imbriqué, via `.join(".")`)
        //  - `message` : message d'erreur Zod (ou personnalisé dans le schéma)
        //
        // HTTP 422 Unprocessable Entity : la requête est syntaxiquement correcte
        // mais sémantiquement invalide — plus précis que 400 Bad Request
        // pour les erreurs de validation métier.
        res.status(422).json({
          message: "Données invalides",
          errors: err.errors.map((e) => ({
            field: e.path.join("."),   // Ex: "email", "adresse.ville"
            message: e.message,        // Ex: "L'email est invalide"
          })),
        });
        return; // Arrête explicitement la chaîne — res.json() ne stoppe pas next()
      }

      // Erreur inattendue (non-Zod) : on la propage au gestionnaire
      // d'erreurs global d'Express via next(err) plutôt que de la swallower.
      next(err);
    }
  };