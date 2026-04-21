import mongoose from 'mongoose';

/**
 * Établit la connexion à la base de données MongoDB via Mongoose.
 *
 * - Lit l'URI depuis la variable d'environnement `MONGO_URI`.
 * - Repli sur une URI locale si la variable est absente (développement).
 * - Termine le processus Node.js en cas d'échec (erreur fatale au démarrage).
 */
const connectDB = async (): Promise<void> => {
  try {
    // Priorité à la variable d'environnement (staging, production).
    // La valeur de repli pointe vers une instance MongoDB locale,
    // utile en développement sans fichier .env configuré.
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nantes-wifi-solutions';

    // Ouvre la connexion. Mongoose gère en interne le pool de connexions —
    // cet appel est fait une seule fois au démarrage de l'application.
    await mongoose.connect(uri);

    console.log('✅ MongoDB connecté');
  } catch (error) {
    // Une erreur ici (URI invalide, serveur inaccessible, auth échouée…)
    // rend l'application non fonctionnelle. On log l'erreur et on arrête
    // le processus avec le code 1 (sortie en échec) pour que le gestionnaire
    // de processus (PM2, Docker, systemd…) puisse relancer ou alerter.
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;