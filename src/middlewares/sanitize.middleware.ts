import type { Request, Response, NextFunction } from "express";

/**
 * Middleware de sanitisation des entrées utilisateur.
 *
 * Nettoie récursivement toutes les chaînes de caractères présentes dans
 * `req.body` afin de neutraliser les tentatives d'injection XSS avant
 * qu'elles n'atteignent la base de données ou ne soient renvoyées au client.
 *
 * Ce middleware est une défense en profondeur : il complète (sans remplacer)
 * la validation de schéma Mongoose et l'échappement côté front-end.
 */

// ─────────────────────────────────────────────
// FONCTION UTILITAIRE : sanitizeValue
// ─────────────────────────────────────────────

/**
 * Nettoie récursivement une valeur de tout contenu HTML/JS potentiellement dangereux.
 *
 * Traitement selon le type de la valeur :
 *  - `string`  → nettoyage des vecteurs XSS connus (voir détail ci-dessous)
 *  - `Array`   → application récursive sur chaque élément
 *  - `object`  → application récursive sur chaque valeur de propriété
 *  - autres    → retourné tel quel (number, boolean, null…)
 *
 * @param value - La valeur à nettoyer (type inconnu à l'entrée)
 * @returns     La valeur nettoyée, de même structure que l'entrée
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      // 1. Supprime les blocs <script>…</script> complets, y compris
      //    les variantes multi-lignes ([\s\S]*? = non-greedy, toutes lignes).
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")

      // 2. Supprime toutes les balises HTML restantes (<img>, <iframe>,
      //    <svg>, <a>…) en ne conservant que leur contenu textuel.
      .replace(/<[^>]+>/g, "")

      // 3. Neutralise les URI "javascript:" utilisées dans les attributs
      //    href/src pour exécuter du code au clic ou au chargement.
      .replace(/javascript:/gi, "")

      // 4. Supprime les gestionnaires d'événements inline (onclick=, onerror=,
      //    onmouseover=…) qui permettent l'exécution de JS sans balise script.
      //    `\w+` couvre tous les noms d'événements, `\s*=` tolère les espaces.
      .replace(/on\w+\s*=/gi, "")

      // 5. Supprime les espaces superflus en début et fin de chaîne.
      .trim();
  }

  // Tableau : on préserve la structure et on sanitise chaque élément.
  if (Array.isArray(value)) return value.map(sanitizeValue);

  // Objet plain (non-null) : on reconstruit l'objet en sanitisant chaque valeur.
  // `Object.fromEntries` + `Object.entries` permet de traiter tous les niveaux
  // d'imbrication sans connaître la profondeur à l'avance (récursivité implicite).
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeValue(v),
      ])
    );
  }

  // Types primitifs non-string (number, boolean, null, undefined) :
  // aucune transformation nécessaire, on retourne la valeur intacte.
  return value;
};

// ─────────────────────────────────────────────
// MIDDLEWARE : sanitizeBody
// ─────────────────────────────────────────────

/**
 * Middleware Express qui applique `sanitizeValue` sur l'intégralité de `req.body`.
 *
 * À monter globalement (avant les routes) ou ciblé sur les routes
 * qui acceptent des entrées utilisateur libres (formulaires, champs texte…).
 *
 * Le paramètre `_res` est préfixé d'un underscore : la réponse n'est
 * pas utilisée ici, ce middleware se contente de transformer la requête
 * et de passer la main via `next()`.
 */
export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    // Remplace req.body par sa version nettoyée.
    // La mutation directe est intentionnelle : c'est le pattern standard
    // des middlewares Express de transformation (body-parser, multer…).
    req.body = sanitizeValue(req.body);
  }

  // Passe au middleware ou handler suivant dans la chaîne Express.
  next();
};