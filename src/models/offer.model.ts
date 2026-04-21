// Importation des modules nécessaires depuis mongoose
import { Schema, model, Document } from 'mongoose';

/**
 * Interface TypeScript représentant une Offre
 * Permet de typer les documents MongoDB et sécuriser le développement
 */
export interface IOffer extends Document {
  title: string;        // Titre de l'offre (ex: "Pack Premium")
  price: number;        // Prix de l'offre en euros
  description: string;  // Description détaillée de l'offre
  features: string[];   // Liste des fonctionnalités incluses
  createdAt: Date;     // Date de création (automatique via timestamps)
  updatedAt: Date;     // Date de mise à jour (automatique via timestamps)
}

/**
 * Schéma Mongoose représentant une offre dans la base de données
 * Définit la structure des documents dans la collection "offers"
 */
const offerSchema = new Schema<IOffer>(
  {
    // Titre de l'offre
    title: {
      type: String,
      required: true,
      trim: true // supprime les espaces inutiles
    },

    // Prix de l'offre
    price: {
      type: Number,
      required: true,
      min: 0 // évite les prix négatifs
    },

    // Description de l'offre
    description: {
      type: String,
      required: true,
      trim: true
    },

    // Liste des fonctionnalités incluses dans l'offre
    features: [
      {
        type: String,
        trim: true
      }
    ]
  },

  /**
   * Options du schéma
   * timestamps: true → ajoute automatiquement createdAt et updatedAt
   */
  {
    timestamps: true
  }
);

/**
 * Export du modèle Offer
 * Permet les opérations CRUD sur la collection "offers"
 */
export default model<IOffer>('Offer', offerSchema);