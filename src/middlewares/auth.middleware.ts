import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extension de l'interface `Request` d'Express pour y attacher
 * le payload JWT décodé après vérification.
 *
 * `user?: any` est typé en `any` pour rester flexible sur la forme
 * du payload (email, id, rôle…). En production, remplacer `any` par
 * une interface précise reflétant la structure réelle du token :
 *
 * @example
 * interface AuthPayload {
 *   email: string;
 *   iat: number;
 *   exp: number;
 * }
 */
interface AuthRequest extends Request {
  user?: any;
}

// ─────────────────────────────────────────────
// MIDDLEWARE : protect
// ─────────────────────────────────────────────

/**
 * Middleware d'authentification JWT.
 * Protège les routes sensibles en vérifiant le token fourni dans
 * l'en-tête `Authorization: Bearer <token>`.
 *
 * Flux :
 *  1. Extraction du token depuis l'en-tête Authorization.
 *  2. Rejet immédiat si aucun token n'est présent.
 *  3. Vérification cryptographique du token via la clé secrète JWT.
 *  4. Injection du payload décodé dans `req.user` pour les handlers suivants.
 *  5. Passage au middleware/handler suivant via `next()`.
 *
 * Réponses :
 *  - 401 "Non autorisé"   → token absent
 *  - 401 "Token invalide" → token malformé, expiré ou signature incorrecte
 */
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Vérifie la présence et le format de l'en-tête Authorization.
  // Le schéma attendu est "Bearer <token>" (séparation par espace).
  // `.startsWith("Bearer")` accepte aussi "Bearer" sans token — le contrôle
  // d'absence ci-dessous prend le relais dans ce cas limite.
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Aucun token extrait → accès refusé immédiatement.
  // On ne différencie pas "header absent" de "format invalide"
  // pour ne pas donner d'indications à un attaquant.
  if (!token) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    // Vérifie la signature du token avec la clé secrète et le décode.
    // `jwt.verify` lève une exception si :
    //  - la signature ne correspond pas (token falsifié)
    //  - le token est expiré (`exp` dépassé)
    //  - le token est malformé
    // Le cast `as string` est nécessaire car `process.env` retourne
    // `string | undefined` — s'assurer que JWT_SECRET est bien défini dans .env.
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // Attache le payload décodé à la requête pour le rendre accessible
    // aux handlers protégés (ex: req.user.email pour identifier l'admin).
    req.user = decoded;

    // Token valide → on passe la main au prochain middleware ou handler.
    next();
  } catch (error) {
    // Toute erreur de vérification JWT est traitée comme un token invalide.
    // On ne distingue pas "expiré" de "falsifié" volontairement (sécurité par opacité).
    return res.status(401).json({ message: "Token invalide" });
  }
};