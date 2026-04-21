// ─────────────────────────────────────────────
// 📦 ENV CONFIG
// ─────────────────────────────────────────────

// Chargement des variables d'environnement (.env)
import dotenv from "dotenv";
dotenv.config(); // ⚠️ doit être exécuté en premier

// ─────────────────────────────────────────────
// 🔒 VALIDATION DES VARIABLES CRITIQUES
// ─────────────────────────────────────────────
if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI manquant");
}

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET manquant");
}

// ─────────────────────────────────────────────
// 🚀 IMPORTS APP + DB
// ─────────────────────────────────────────────

// Application Express (routes + middleware + config)
import app from "./app";

// Connexion MongoDB
import connectDB from "./config/db";

// ─────────────────────────────────────────────
// ⚙️ CONFIGURATION SERVEUR
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

/**
 * 🚀 Démarrage du serveur
 * - connexion DB
 * - lancement API Express
 */
const start = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log("✅ Base de données connectée");

    // Lancement serveur HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur :", error);
    process.exit(1);
  }
};

// ─────────────────────────────────────────────
// 🛑 GESTION ARRÊT PROPRE (PRODUCTION)
// ─────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM reçu - arrêt du serveur...");
  process.exit(0);
});

// ─────────────────────────────────────────────
// 🧠 LANCEMENT APP
// ─────────────────────────────────────────────
start();