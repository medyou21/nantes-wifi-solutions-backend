import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import { corsOptions }    from "./config/cors.config";
import { globalLimiter }  from "./config/rateLimit.config";
import { sanitizeBody }   from "./middlewares/sanitize.middleware";

import contactRoutes from "./routes/contact.routes";
import adminRoutes   from "./routes/admin.routes";
import offerRoutes from "./routes/offer.routes";


const app = express();

// ── 1. Helmet (headers HTTP sécurisés) ────────
app.use(helmet());

// ── 2. CORS ───────────────────────────────────
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// ── 3. Body parser ────────────────────────────
app.use(express.json({ limit: "10kb" })); // limite taille body
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── 4. Sanitize NoSQL injection ($where, $gt…) 
app.use(mongoSanitize());

// ── 5. Sanitize XSS (global) ──────────────────
app.use(sanitizeBody);

// ── 6. Rate limit global ──────────────────────
app.use("/api", globalLimiter);

// ── 7. Routes ─────────────────────────────────
app.use("/api/contact", contactRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/offers", offerRoutes);

// ── 8. 404 ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// ── 9. Error handler global ───────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Erreur globale :", err.message);

  if (err.message?.startsWith("CORS")) {
    res.status(403).json({ message: "Accès refusé (CORS)" });
    return;
  }

  res.status(err.status ?? 500).json({
    message: err.message ?? "Erreur serveur",
  });
});

export default app;