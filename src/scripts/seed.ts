import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import Admin from "../models/admin.model";
import Offer from "../models/offer.model";
import Contact from "../models/contact.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI non défini");
}

// ─────────────────────────────────────────────
// 📦 OFFERS FIXES
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
// 🧠 SERVICES LIST
// ─────────────────────────────────────────────
const services = [
  "diagnostic",
  "installation",
  "securite",
  "maintenance",
];

// ─────────────────────────────────────────────
// 🌱 SEED
// ─────────────────────────────────────────────
const seed = async () => {
  try {
    console.log("🔌 Connexion MongoDB...");
    await mongoose.connect(MONGO_URI!);
    console.log("✅ Connecté");

    // 🧹 CLEAN
    await Promise.all([
      Admin.deleteMany({}),
      Offer.deleteMany({}),
      Contact.deleteMany({}),
    ]);

    console.log("🗑️ Base nettoyée");

    // ─────────────────────────────
    // 🔐 ADMIN
    // ─────────────────────────────
    const hashedPassword = await bcrypt.hash("123456", 10);

    await Admin.create({
      email: "admin@nantes-wifi.fr",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("👤 Admin créé");

    // ─────────────────────────────
    // 📦 OFFERS
    // ─────────────────────────────
    await Offer.insertMany(offers);
    console.log("📦 Offers insérées");

    // ─────────────────────────────
    // 🧪 CONTACTS FAKE (FAKER)
    // ─────────────────────────────
    const fakeContacts = Array.from({ length: 50 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number({ style: "national" }),
      service: faker.helpers.arrayElement(services),
      message: faker.lorem.sentences({ min: 1, max: 3 }),
      createdAt: faker.date.recent({ days: 30 }),
    }));

    await Contact.insertMany(fakeContacts);

    console.log(`📩 ${fakeContacts.length} contacts Faker insérés`);

    // ─────────────────────────────
    // 📊 STATS
    // ─────────────────────────────
    const [a, o, c] = await Promise.all([
      Admin.countDocuments(),
      Offer.countDocuments(),
      Contact.countDocuments(),
    ]);

    console.log("\n🎉 SEED TERMINÉ !");
    console.log("--------------------------------");
    console.log("👤 Admins   :", a);
    console.log("📦 Offers   :", o);
    console.log("📩 Contacts :", c);
    console.log("--------------------------------");

  } catch (error) {
    console.error("❌ Erreur seed :", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Déconnecté MongoDB");
  }
};

seed();