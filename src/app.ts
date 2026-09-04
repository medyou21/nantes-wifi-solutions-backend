import express from "express";

// Middleware de sécurité HTTP headers (Helmet)
import helmet from "helmet";

// Middleware CORS pour contrôler les accès frontend/backend
import cors from "cors";

// Protection contre injection NoSQL (MongoDB)
import mongoSanitize from "express-mongo-sanitize";

// Configuration CORS personnalisée
import { corsOptions } from "./config/cors.config";

// Limiteur global de requêtes (anti DDoS / abuse)
import { globalLimiter } from "./config/rateLimit.config";

// Middleware custom de sanitization (anti XSS / nettoyage input)
import { sanitizeBody } from "./middlewares/sanitize.middleware";

// Routes de l'application
import contactRoutes from "./routes/contact.routes";
import adminRoutes from "./routes/admin.routes";
import offerRoutes from "./routes/offer.routes";

// Création de l'application Express
const app = express();
/**
 * Cloudflare Tunnel agit comme proxy inverse devant Express.
 * On autorise un niveau de proxy pour récupérer correctement req.ip.
 */
app.set("trust proxy", 1);

/**
 * ─────────────────────────────────────────────
 * 1. 🔒 Sécurité HTTP headers (Helmet)
 * ─────────────────────────────────────────────
 * Protège contre attaques classiques :
 * - XSS
 * - clickjacking
 * - sniffing MIME
 */
app.use(helmet());

/**
 * ─────────────────────────────────────────────
 * 2. 🌍 CORS (Cross-Origin Resource Sharing)
 * ─────────────────────────────────────────────
 * Autorise uniquement les domaines autorisés
 */
app.use(cors(corsOptions));

// Gestion des requêtes preflight (OPTIONS)
app.options("*", cors(corsOptions));

/**
 * ─────────────────────────────────────────────
 * 3. 📦 Parsers JSON / URL encoded
 * ─────────────────────────────────────────────
 * Limite taille body pour éviter payload abuse
 */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/**
 * ─────────────────────────────────────────────
 * 4. 🛡️ Protection NoSQL Injection (MongoDB)
 * ─────────────────────────────────────────────
 * Supprime les opérateurs dangereux ($gt, $where, etc.)
 */
app.use(mongoSanitize());

/**
 * ─────────────────────────────────────────────
 * 5. 🧼 Sanitization XSS custom
 * ─────────────────────────────────────────────
 * Nettoie les inputs utilisateur (scripts, HTML injecté)
 */
app.use(sanitizeBody);

/**
 * ─────────────────────────────────────────────
 * 6. 🚦 Rate limiting global
 * ─────────────────────────────────────────────
 * Limite les requêtes sur /api pour éviter :
 * - brute force
 * - spam
 * - surcharge serveur
 */
app.use("/api", globalLimiter);

/**
 * ─────────────────────────────────────────────
 * 7. 📡 ROUTES API
 * ─────────────────────────────────────────────
 */
app.use("/api/contacts", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/offers", offerRoutes);

/**
 * ─────────────────────────────────────────────
 * 8. ❌ ROUTE 404 (non trouvée)
 * ─────────────────────────────────────────────
 */
app.use((_req, res) => {
  res.status(404).json({
    message: "Route introuvable",
  });
});

/**
 * ─────────────────────────────────────────────
 * 9. ⚠️ HANDLER GLOBAL DES ERREURS
 * ─────────────────────────────────────────────
 * Centralise toutes les erreurs de l'application
 */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("❌ Erreur globale :", err.message);

    // Gestion spécifique CORS
    if (err.message?.startsWith("CORS")) {
      return res.status(403).json({
        message: "Accès refusé (CORS)",
      });
    }

    // Erreur générique serveur
    return res.status(err.status ?? 500).json({
      message: err.message ?? "Erreur serveur",
    });
  }
);

// Export de l'application Express
export default app;