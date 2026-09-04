/**
 * Configuration CORS de l’API Nantes WiFi Solutions.
 *
 * CORS (Cross-Origin Resource Sharing) contrôle les sites autorisés
 * à envoyer des requêtes vers le backend.
 *
 * Exemples :
 * - Frontend local : http://localhost:5173
 * - Frontend sur le réseau local : http://192.168.1.16:5173
 * - Frontend exposé par Cloudflare Tunnel :
 *   https://ahead-qualify-demonstrate-matrix.trycloudflare.com
 */

import "dotenv/config";
import type { CorsOptions } from "cors";

// ─────────────────────────────────────────────
// ORIGINES FOURNIES PAR LE FICHIER .ENV
// ─────────────────────────────────────────────

/**
 * CLIENT_URL contient l’adresse autorisée du frontend.
 *
 * Exemple dans le fichier .env :
 *
 * CLIENT_URL=https://ahead-qualify-demonstrate-matrix.trycloudflare.com
 *
 * Il est également possible d’indiquer plusieurs adresses séparées
 * par des virgules :
 *
 * CLIENT_URL=http://192.168.1.16:5173,https://exemple.trycloudflare.com
 *
 * split(",") sépare les différentes adresses.
 * trim() supprime les espaces inutiles.
 * filter(Boolean) supprime les valeurs vides.
 */
const configuredOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ─────────────────────────────────────────────
// LISTE DES ORIGINES AUTORISÉES
// ─────────────────────────────────────────────

/**
 * Liste complète des frontends autorisés à appeler l’API.
 *
 * Important :
 * - Une origine contient le protocole, le domaine ou l’adresse IP et le port.
 * - Il ne faut pas ajouter de barre oblique à la fin.
 * - http://localhost:5173 et http://localhost:5173/ sont considérés
 *   comme deux valeurs différentes lors d’une comparaison de chaînes.
 */
const ALLOWED_ORIGINS: string[] = [
  // Frontend Vite sur le même ordinateur
  "http://localhost:5173",

  // Frontend accessible depuis le réseau Wi-Fi local
  "http://192.168.1.16:5173",

  // Autre port local éventuellement utilisé par le frontend
  "http://localhost:3000",

  // Domaines prévus pour la production
  "https://nantes-wifi.fr",
  "https://www.nantes-wifi.fr",

  // Adresses configurées dans CLIENT_URL
  ...configuredOrigins,
];

// ─────────────────────────────────────────────
// OPTIONS CORS
// ─────────────────────────────────────────────

export const corsOptions: CorsOptions = {
  /**
   * Cette fonction est appelée pour chaque requête reçue.
   *
   * Le paramètre origin contient l’adresse du site qui appelle l’API.
   * Par exemple :
   *
   * https://ahead-qualify-demonstrate-matrix.trycloudflare.com
   */
  origin: (origin, callback) => {
    /**
     * Certaines requêtes n’ont pas d’en-tête Origin :
     * - Postman ;
     * - curl ;
     * - applications mobiles natives ;
     * - communications serveur à serveur.
     *
     * Elles sont autorisées ici.
     */
    if (!origin) {
      return callback(null, true);
    }

    /**
     * L’origine reçue doit correspondre exactement à une adresse
     * présente dans ALLOWED_ORIGINS.
     */
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    /**
     * En cas de refus, les informations sont affichées dans le terminal
     * du backend pour faciliter le diagnostic.
     */
    console.error("❌ Origine CORS refusée :", origin);
    console.error("✅ Origines CORS autorisées :", ALLOWED_ORIGINS);

    return callback(
      new Error(`CORS bloqué : origine non autorisée → ${origin}`)
    );
  },

  /**
   * Autorise les informations d’authentification.
   *
   * Cette option est nécessaire lorsqu’un frontend transmet :
   * - des cookies ;
   * - une session ;
   * - certaines informations d’authentification.
   */
  credentials: true,

  /**
   * Méthodes HTTP autorisées.
   *
   * OPTIONS est utilisé automatiquement par le navigateur pour
   * effectuer une requête de vérification appelée "preflight".
   */
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  /**
   * En-têtes que le frontend peut envoyer au backend.
   *
   * Content-Type est nécessaire pour envoyer du JSON.
   * Authorization est nécessaire pour transmettre le JWT.
   */
  allowedHeaders: ["Content-Type", "Authorization"],

  /**
   * En-têtes que le navigateur est autorisé à rendre accessibles
   * au code JavaScript du frontend.
   */
  exposedHeaders: ["Content-Length"],

  /**
   * Durée pendant laquelle le navigateur peut conserver en cache
   * le résultat de la requête CORS preflight.
   *
   * Valeur exprimée en secondes : 600 secondes = 10 minutes.
   */
  maxAge: 600,

  /**
   * Réponse HTTP utilisée pour les requêtes OPTIONS.
   * Le statut 204 signifie que la requête a réussi sans contenu.
   */
  optionsSuccessStatus: 204,
};

export default corsOptions;