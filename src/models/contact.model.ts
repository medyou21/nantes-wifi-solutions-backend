// Importation des éléments nécessaires depuis mongoose
import { Schema, model, Document } from 'mongoose';

/**
 * Interface TypeScript représentant un document Contact dans MongoDB
 * Elle permet de typer correctement les données du modèle
 */
export interface IContact extends Document {
  name: string;        // Nom du contact (obligatoire)
  email: string;       // Email du contact (obligatoire)
  phone?: string;      // Numéro de téléphone (optionnel)
  company?: string;    // Nom de l'entreprise (optionnel)
  service?: string;    // Service demandé (optionnel)
  message: string;     // Message envoyé (obligatoire)
  status: 'new' | 'contacted' | 'closed';

  createdAt: Date;     // Date de création (ajoutée automatiquement)
  updatedAt: Date;     // Date de mise à jour (ajoutée automatiquement)
}

/**
 * Définition du schéma Mongoose pour la collection "contacts"
 * Ce schéma définit la structure des documents stockés dans MongoDB
 */
const contactSchema = new Schema<IContact>(
  {
    // Nom de l'utilisateur
    name: {
      type: String,
      required: true, // champ obligatoire
      trim: true      // supprime les espaces inutiles
    },

    // Email de l'utilisateur
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true // convertit automatiquement en minuscules
    },

    // Téléphone (facultatif)
    phone: {
      type: String,
      trim: true
    },

    // Nom de l'entreprise (facultatif)
    company: {
      type: String,
      trim: true
    },

    // Service demandé (ex: devis, support, etc.)
    service: {
      type: String,
      trim: true
    },

    // Message envoyé par l'utilisateur
    message: {
      type: String,
      required: true
    },

    // État de traitement piloté depuis le back-office (partie UPDATE du CRUD)
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true
    }
  },

  /**
   * Options du schéma :
   * timestamps: true → ajoute automatiquement createdAt et updatedAt
   */
  { timestamps: true }
);

/**
 * Export du modèle Contact
 * Permet d'effectuer des opérations CRUD sur la collection "contacts"
 */
export default model<IContact>('Contact', contactSchema);
