import jwt from "jsonwebtoken";

/**
 * Payload du JWT (extensible)
 */
interface TokenPayload {
  id: string;
  role?: string;
}

/**
 * 🔐 Génération sécurisée d'un token JWT
 *
 * @param payload - données utilisateur à inclure dans le token
 * @param expiresIn - durée de validité (par défaut : 1 jour)
 */
export const generateToken = (
  payload: TokenPayload,
  expiresIn: jwt.SignOptions["expiresIn"] = "1d"
): string => {
  // Sécurité : vérification de la clé secrète
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("❌ JWT_SECRET non défini dans les variables d'environnement");
  }

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn,        // durée de vie du token
      algorithm: "HS256" // algorithme explicite (bonne pratique)
    }
  );
};