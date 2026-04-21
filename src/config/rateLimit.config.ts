import rateLimit from "express-rate-limit";

/**
 * Limiteurs de débit (rate limiters) de l'application.
 *
 * Chaque limiteur est un middleware Express indépendant, appliqué
 * sur un groupe de routes spécifique selon le niveau de risque.
 *
 * Fonctionnement général :
 *  - Une fenêtre glissante (`windowMs`) est associée à chaque IP.
 *  - Si le nombre de requêtes dépasse `max` dans cette fenêtre,
 *    le middleware répond automatiquement avec un HTTP 429.
 *  - `standardHeaders: true`  → renvoie les en-têtes RateLimit-* (RFC 6585)
 *  - `legacyHeaders: false`   → supprime les anciens en-têtes X-RateLimit-*
 */

// ── API générale ──────────────────────────────

/**
 * Limiteur appliqué à l'ensemble des routes de l'API.
 * Protège contre les abus et le scraping basique.
 *
 * Seuil : 100 requêtes par IP toutes les 15 minutes.
 * Suffisant pour un usage légitime intensif tout en bloquant les bots peu sophistiqués.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre glissante de 15 minutes
  max: 100,                  // Maximum 100 requêtes par IP par fenêtre
  standardHeaders: true,     // Expose RateLimit-Limit / RateLimit-Remaining / RateLimit-Reset
  legacyHeaders: false,      // Désactive X-RateLimit-* (déprécié)
  message: {
    status: 429,
    message: "Trop de requêtes, veuillez réessayer dans 15 minutes.",
  },
});

// ── Formulaire de contact (anti-spam strict) ──

/**
 * Limiteur strict réservé aux routes d'envoi de messages/contact.
 * Empêche le spam automatisé vers les boîtes mail ou les systèmes de ticketing.
 *
 * Seuil : 5 messages par IP par heure — largement suffisant pour un humain,
 * dissuasif pour un script de spam.
 *
 * Note : `skipSuccessfulRequests: false` comptabilise TOUTES les requêtes,
 * même celles qui aboutissent (HTTP 2xx). Sans cette option, un attaquant
 * pourrait envoyer indéfiniment des messages valides sans jamais être bloqué.
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,      // Fenêtre glissante d'1 heure
  max: 5,                         // Maximum 5 envois par IP par heure
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Trop de messages envoyés. Veuillez réessayer dans 1 heure.",
  },
  skipSuccessfulRequests: false,  // Compte aussi les requêtes ayant réussi (anti-spam)
});

// ── Authentification (anti brute-force) ───────

/**
 * Limiteur appliqué aux routes de connexion et d'authentification.
 * Mitigue les attaques par force brute sur les mots de passe.
 *
 * Seuil : 10 tentatives par IP en 15 minutes. Au-delà, l'IP est mise
 * en attente — ce qui rend une attaque par dictionnaire pratiquement
 * infaisable sans rotation d'adresses IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre glissante de 15 minutes
  max: 10,                   // Maximum 10 tentatives par IP par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
});