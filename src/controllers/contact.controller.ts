import { Request, Response } from "express";
import Contact from "../models/contact.model";
import { sendDevisMails } from "../services/mail.service";

/**
 * Contrôleurs publics pour la gestion des demandes de contact/devis.
 *
 * - `createContact` : reçoit le formulaire public, persiste en base et
 *                     déclenche l'envoi des emails de devis en arrière-plan.
 * - `getContacts`   : expose la liste des contacts (usage interne/admin).
 */

// ─────────────────────────────────────────────
// POST /api/contacts
// ─────────────────────────────────────────────

/**
 * Crée un nouveau contact à partir du corps de la requête,
 * puis déclenche l'envoi asynchrone des emails de devis.
 *
 * Flux :
 *  1. Instanciation et validation Mongoose depuis `req.body`.
 *  2. Persistance en base de données.
 *  3. Formatage des dates en ISO 8601 pour la réponse JSON.
 *  4. Envoi des emails en arrière-plan (non bloquant).
 *  5. Réponse immédiate 201 au client — sans attendre les emails.
 *
 * Réponses :
 *  - 201 + contact créé  → succès
 *  - 500                 → erreur Mongoose ou inattendue
 */
export const createContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Instancie un document Mongoose depuis le corps de la requête.
    // La validation du schéma (champs requis, types, etc.) est appliquée
    // automatiquement par Mongoose lors du `save()` ci-dessous.
    const contact = new Contact(req.body);
    const saved   = await contact.save();

    // Sérialise le document Mongoose en objet JS brut (`toObject()`),
    // puis normalise les dates en chaînes ISO 8601 pour garantir
    // un format de date cohérent et universel côté client.
    const formatted = {
      ...saved.toObject(),
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };

    // Lance la génération du PDF et l'envoi des emails de façon non bloquante.
    // Le `.catch(console.error)` assure que les erreurs mail sont loguées
    // sans rejeter la promesse principale ni retarder la réponse HTTP.
    // ⚠️  Conséquence : si l'envoi mail échoue, le client ne le sait pas.
    //     Envisager une file de retry (Bull, BullMQ) si la fiabilité est critique.
    sendDevisMails(saved).catch(console.error);

    // Répond immédiatement après la sauvegarde, sans attendre la fin de l'envoi mail.
    // Cela évite de faire patienter l'utilisateur le temps du traitement SMTP/PDF.
    res.status(201).json({
      message: "Demande envoyée avec succès. Votre devis arrive par email.",
      contact: formatted,
    });
  } catch (error) {
    console.error("❌ createContact:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi." });
  }
};

// ─────────────────────────────────────────────
// GET /api/contacts
// ─────────────────────────────────────────────

/**
 * Retourne tous les contacts enregistrés, du plus récent au plus ancien.
 *
 * Utilise `.lean()` pour obtenir des objets JS purs plutôt que des instances
 * Mongoose complètes — gain de performance notable sur les grandes collections
 * (pas de getters/setters, pas de tracking des modifications).
 *
 * Les dates sont re-formatées en ISO 8601 pour homogénéiser la réponse
 * avec celle de `createContact` (`.lean()` retourne des objets Date natifs).
 *
 * Réponses :
 *  - 200 + tableau de contacts  → succès
 *  - 500                        → erreur base de données
 */
export const getContacts = async (
  _req: Request, // Requête non utilisée dans ce handler (préfixe _ intentionnel)
  res: Response
): Promise<void> => {
  try {
    // `.lean()` court-circuite l'hydratation Mongoose : les documents retournés
    // sont de simples objets JS, plus légers et plus rapides à sérialiser en JSON.
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();

    // Re-formatage défensif des dates : `.lean()` retourne des objets Date natifs
    // (pas des strings), d'où la conversion explicite. Le `? ... : null` protège
    // contre les documents anciens qui pourraient ne pas avoir ces champs.
    const formattedContacts = contacts.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
      updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null,
    }));

    res.status(200).json(formattedContacts);
  } catch (error) {
    console.error("❌ getContacts:", error);
    res.status(500).json({ message: "Erreur lors de la récupération." });
  }
};