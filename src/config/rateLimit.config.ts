import rateLimit from "express-rate-limit";

// ── API générale ──────────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Trop de requêtes, veuillez réessayer dans 15 minutes.",
  },
});

// ── Contact form (anti-spam strict) ──────────
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Trop de messages envoyés. Veuillez réessayer dans 1 heure.",
  },
  skipSuccessfulRequests: false,
});

// ── Auth (anti brute-force) ───────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
});