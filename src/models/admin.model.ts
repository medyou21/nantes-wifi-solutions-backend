import { Schema, model, Document } from "mongoose";

/**
 * Interface TypeScript décrivant la structure d'un document Admin en base.
 *
 * Étend `Document` de Mongoose pour hériter des propriétés et méthodes
 * natives (_id, save(), toObject()…), tout en typant les champs métier.
 *
 * ⚠️  Le champ `password` stocke le hash bcrypt — jamais le mot de passe
 *     en clair. Ce typage `string` couvre les deux cas ; la responsabilité
 *     du hachage appartient au service/contrôleur qui crée ou modifie un admin.
 */
export interface IAdmin extends Document {
  email: string;
  password: string;                  // Hash bcrypt uniquement — jamais en clair
  role: "admin" | "superadmin";      // Union littérale : restreint les valeurs autorisées
}

/**
 * Schéma Mongoose pour la collection `admins`.
 *
 * Définit la structure, les contraintes et les valeurs par défaut
 * des documents administrateurs en base MongoDB.
 */
const adminSchema = new Schema<IAdmin>(
  {
    // Identifiant de connexion — unique garantit qu'un même email
    // ne peut pas être enregistré deux fois (index unique en base).
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Mot de passe haché (bcrypt recommandé, coût ≥ 10).
    // `required: true` empêche la création d'un admin sans mot de passe,
    // mais ne valide pas la force du mot de passe — à gérer en amont.
    password: {
      type: String,
      required: true,
    },

    // Rôle de l'administrateur.
    // `default: "admin"` évite d'avoir à le spécifier à chaque création.
    // Note : le schéma n'applique pas l'union TypeScript `"admin" | "superadmin"`
    // au niveau MongoDB — ajouter `enum: ["admin", "superadmin"]` pour
    // une contrainte effective en base et non seulement au niveau TypeScript.
   role: {
  type: String,
  enum: ["admin", "superadmin"],
  default: "admin",
},
  },
  {
    // Ajoute automatiquement les champs `createdAt` et `updatedAt`
    // gérés par Mongoose — utiles pour l'audit et le tri chronologique.
    timestamps: true,
  }
);

/**
 * Modèle Mongoose `Admin` lié à la collection `admins` (pluralisé automatiquement).
 * Exporté par défaut pour être importé dans les contrôleurs et services.
 */
export default model<IAdmin>("Admin", adminSchema);