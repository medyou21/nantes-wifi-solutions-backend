import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const offerSchema = new mongoose.Schema({
  title: String,
  price: Number,
  period: String,
  features: [String],
  highlight: Boolean,
  order: Number,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);
const Offer = mongoose.model("Offer", offerSchema);

const offers = [
  {
    title: "Basic",
    price: 79,
    period: null,
    features: ["Diagnostic Wi-Fi", "Optimisation réseau", "Vérification sécurité"],
    highlight: false,
    order: 1,
  },
  {
    title: "Confort",
    price: 199,
    period: null,
    features: ["Diagnostic Wi-Fi", "Installation avancée", "Matériel inclus"],
    highlight: true,
    order: 2,
  },
  {
    title: "Pro Entreprise",
    price: 499,
    period: "/mois",
    features: ["Tous les forfaits Basic inclus", "Réseau professionnel", "Surveillance en continu"],
    highlight: false,
    order: 3,
  },
];

const seed = async () => {
  try {
    console.log("🔌 Connexion à MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté !");

    // Vider les collections existantes
    await Offer.deleteMany({});
    await Contact.deleteMany({});
    console.log("🗑️  Collections vidées");

    // Insérer les offres
    await Offer.insertMany(offers);
    console.log("✅ 3 offres insérées");

    // Insérer un contact de test
    await Contact.create({
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      phone: "06 12 34 56 78",
      service: "diagnostic",
      message: "Mon Wi-Fi est très lent dans le salon.",
    });
    console.log("✅ 1 contact de test inséré");

    console.log("\n🎉 Seed terminé avec succès !");
    console.log("📦 Collections créées sur MongoDB Atlas :");
    console.log("   - offers   :", await Offer.countDocuments(), "documents");
    console.log("   - contacts :", await Contact.countDocuments(), "documents");

  } catch (error) {
    console.error("❌ Erreur seed :", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB");
    process.exit(0);
  }
};

seed();