// Importation de mongoose pour gérer la connexion MongoDB
import mongoose from "mongoose";

// Chargement des variables d'environnement (.env)
import dotenv from "dotenv";

// Librairie pour hasher les mots de passe
import bcrypt from "bcrypt";

// Librairie pour générer des données fictives (tests / seed)
import { faker } from "@faker-js/faker";

// Importation des modèles MongoDB
import Admin from "../models/admin.model";
import Offer from "../models/offer.model";
import Contact from "../models/contact.model";

// Chargement des variables d'environnement
dotenv.config();

// Récupération de l'URI MongoDB depuis .env
const MONGO_URI = process.env.MONGO_URI;

// Sécurité : arrêt si la variable n'existe pas
if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI non défini");
}

// ─────────────────────────────────────────────
// 📦 OFFRES FIXES (données initiales du système)
// ─────────────────────────────────────────────
const offers = [
  {
    title: "Basic",
    price: 79,
    description: "Diagnostic Wi-Fi complet pour votre réseau.",
    features: ["Audit Wi-Fi", "Optimisation", "Conseils sécurité"],
    highlight: false,
    order: 1,
  },
  {
    title: "Confort",
    price: 199,
    description: "Installation et optimisation avancée.",
    features: ["Installation complète", "Configuration réseau", "Support inclus"],
    highlight: true,
    order: 2,
  },
  {
    title: "Pro Entreprise",
    price: 499,
    description: "Solution professionnelle multi-sites.",
    features: ["Multi-access points", "Monitoring", "Maintenance"],
    highlight: false,
    order: 3,
  },
];

// ─────────────────────────────────────────────
// 🧠 LISTE DES SERVICES (utilisée pour contacts fake)
// ─────────────────────────────────────────────
const services = [
  "diagnostic",
  "installation",
  "securite",
  "maintenance",
];

// ─────────────────────────────────────────────
// 🌱 SCRIPT DE SEEDING (initialisation base de données)
// ─────────────────────────────────────────────
const seed = async () => {
  try {
    console.log("🔌 Connexion MongoDB...");

    // Connexion à la base MongoDB
    await mongoose.connect(MONGO_URI!);

    console.log("✅ Connecté à MongoDB");

    // ─────────────────────────────
    // 🧹 NETTOYAGE DE LA BASE
    // ─────────────────────────────
    // Supprime toutes les données existantes pour repartir proprement
    await Promise.all([
      Admin.deleteMany({}),
      Offer.deleteMany({}),
      Contact.deleteMany({}),
    ]);

    console.log("🗑️ Base de données nettoyée");

    // ─────────────────────────────
    // 🔐 CRÉATION ADMIN PAR DÉFAUT
    // ─────────────────────────────
    // Hash du mot de passe pour sécurité
    const hashedPassword = await bcrypt.hash("123456", 10);

    await Admin.create({
      email: "admin@nantes-wifi.fr",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("👤 Admin créé avec succès");

    // ─────────────────────────────
    // 📦 INSERTION DES OFFRES
    // ─────────────────────────────
    await Offer.insertMany(offers);

    console.log("📦 Offres insérées");

    // ─────────────────────────────
    // 🧪 GÉNÉRATION DE CONTACTS FACTICES
    // ─────────────────────────────
    const fakeContacts = Array.from({ length: 50 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number({ style: "national" }),
      service: faker.helpers.arrayElement(services),
      message: faker.lorem.sentences({ min: 1, max: 3 }),
      createdAt: faker.date.recent({ days: 30 }),
    }));

    // Insertion des contacts fake en base
    await Contact.insertMany(fakeContacts);

    console.log(`📩 ${fakeContacts.length} contacts générés`);

    // ─────────────────────────────
    // 📊 STATISTIQUES FINALES
    // ─────────────────────────────
    const [adminCount, offerCount, contactCount] = await Promise.all([
      Admin.countDocuments(),
      Offer.countDocuments(),
      Contact.countDocuments(),
    ]);

    console.log("\n🎉 SEED TERMINÉ AVEC SUCCÈS !");
    console.log("--------------------------------");
    console.log("👤 Admins   :", adminCount);
    console.log("📦 Offers   :", offerCount);
    console.log("📩 Contacts :", contactCount);
    console.log("--------------------------------");

  } catch (error) {
    // Gestion des erreurs globales
    console.error("❌ Erreur seed :", error);

  } finally {
    // Fermeture propre de la connexion MongoDB
    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB");
  }
};

// Exécution du script
seed();