import "dotenv/config";
import type { CorsOptions } from "cors";

/**
 * Liste des origines autorisées à accéder à l'API.
 * - Environnements de développement local (Vite sur 5173, Express/autre sur 3000)
 * - Domaines de production Nantes WiFi (avec et sans www)
 */
const configuredOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://192.168.1.16:5173",
  "http://localhost:3000",
  "https://nantes-wifi.fr",
  "https://www.nantes-wifi.fr",
  ...configuredOrigins,
];

/**
 * Configuration CORS (Cross-Origin Resource Sharing) de l'application.
 *
 * Détermine quels clients externes sont autorisés à faire des requêtes HTTP
 * vers cette API, et selon quelles conditions.
 */
export const corsOptions: CorsOptions = {
  /**
   * Fonction de validation dynamique de l'origine.
   * Appelée automatiquement par le middleware `cors` à chaque requête entrante.
   *
   * @param origin  - L'origine de la requête (ex: "http://localhost:5173"),
   *                  ou `undefined` si la requête ne provient pas d'un navigateur.
   * @param callback - Fonction à appeler pour approuver ou rejeter l'origine.
   *                   Signature : callback(erreur | null, autorisé?: boolean)
   */
  origin: (origin, callback) => {
    // Les requêtes sans en-tête Origin (outils comme Postman, clients mobiles
    // natifs, appels serveur-à-serveur) sont autorisées sans restriction.
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      // Origine reconnue → requête autorisée
      return callback(null, true);
    }

    console.error("Origine CORS refusée :", origin);
    return callback(new Error(`CORS bloqué : origine non autorisée → ${origin}`));
  },

  // Autorise l'envoi de cookies et d'en-têtes d'authentification (ex: JWT en cookie HttpOnly)
  // dans les requêtes cross-origin. Nécessite que le client définisse `withCredentials: true`.
  credentials: true,

  // Verbes HTTP acceptés. OPTIONS est requis pour les requêtes préliminaires (preflight).
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // En-têtes que le client est autorisé à envoyer dans ses requêtes cross-origin.
  // - Content-Type : pour les corps JSON, form-data, etc.
  // - Authorization : pour les tokens Bearer (JWT transmis en header)
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
};
