import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de validation du formulaire de contact.
 *
 * Vérifie que les trois champs obligatoires (`name`, `email`, `message`)
 * sont présents et conformes aux contraintes minimales avant de laisser
 * passer la requête vers le handler `createContact`.
 *
 * Répond avec un HTTP 400 dès la première erreur rencontrée (fail-fast) :
 * une seule erreur est retournée à la fois, ce qui simplifie le traitement
 * côté client.
 *
 * Note : ce middleware est une validation légère "à la main". Si les règles
 * de validation se complexifient, envisager de le remplacer par le middleware
 * `validate(contactSchema)` basé sur Zod, déjà présent dans le projet.
 */
export const validateContact = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, message } = req.body;

  // ── Validation du nom ───────────────────────────────────────────────
  // Triple garde :
  //  1. `!name`                   → champ absent ou falsy (null, undefined, "")
  //  2. `typeof name !== 'string` → type inattendu (nombre, objet…)
  //  3. `name.trim().length < 2`  → chaîne trop courte après suppression
  //                                  des espaces superflus
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ message: 'Le nom est requis (minimum 2 caractères).' });
    return; // Stoppe la chaîne — empêche next() d'être appelé après res.json()
  }

  // ── Validation de l'email ───────────────────────────────────────────
  // Regex minimaliste : vérifie la structure "local@domaine.extension"
  // sans espace ni @-sign dans chaque segment.
  // Couvre les cas courants sans sur-complexifier (RFC 5322 complet
  // serait excessif pour un formulaire de contact).
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ message: 'Email invalide.' });
    return;
  }

  // ── Validation du message ───────────────────────────────────────────
  // Même pattern que pour `name` : présence, type, et longueur minimale.
  // 10 caractères est un seuil bas intentionnel pour filtrer les envois
  // accidentels ou vides sans bloquer les messages légitimement courts.
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    res.status(400).json({ message: 'Le message est requis (minimum 10 caractères).' });
    return;
  }

  // Tous les champs sont valides → on passe au middleware ou handler suivant.
  next();
};