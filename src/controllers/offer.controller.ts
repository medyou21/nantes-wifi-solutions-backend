import { Request, Response } from 'express';
import Offer from '../models/offer.model';

/**
 * Données d'initialisation (seed) des offres commerciales.
 *
 * Insérées automatiquement en base au premier appel de `getOffers`
 * si la collection est vide. Évite de maintenir un script de seed
 * séparé pour un catalogue de taille fixe comme celui-ci.
 *
 * ⚠️  Si les prix ou les features évoluent, modifier ces valeurs
 *     ne mettra PAS à jour les documents déjà en base — il faudra
 *     soit vider la collection, soit prévoir une migration.
 */
const defaultOffers = [
  {
    title: 'Formule Essentielle',
    price: 29.99,
    description: 'WiFi fiable pour les petites structures.',
    features: ['Jusqu\'à 10 appareils', 'Support email', 'Installation incluse'],
  },
  {
    title: 'Formule Pro',
    price: 59.99,
    description: 'Solution complète pour les PME nantaises.',
    features: ['Appareils illimités', 'Support 24/7', 'Routeur fourni', 'SLA garanti'],
  },
  {
    title: 'Formule Entreprise',
    price: 99.99,
    description: 'Infrastructure WiFi haute performance.',
    features: ['Multi-sites', 'Dashboard admin', 'Support dédié', 'Audit réseau'],
  },
];

// ─────────────────────────────────────────────
// GET /api/offers
// ─────────────────────────────────────────────

/**
 * Retourne la liste des offres disponibles.
 * Déclenche un seed automatique si la collection MongoDB est vide.
 *
 * Stratégie "lazy seed" :
 *  - Pas de script d'initialisation externe à maintenir.
 *  - Les offres par défaut sont insérées à la première requête réelle,
 *    que ce soit en développement ou au premier démarrage en production.
 *
 * Réponses :
 *  - 200 + tableau d'offres  → succès (collection existante ou seedée)
 *  - 500                     → erreur base de données
 */
export const getOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    let offers = await Offer.find();

    // Si la collection est vide (premier lancement, base réinitialisée…),
    // on insère les offres par défaut en une seule opération bulk.
    // `insertMany` retourne directement les documents créés avec leur _id,
    // ce qui permet de les renvoyer immédiatement sans second appel à la base.
    if (offers.length === 0) {
      offers = await Offer.insertMany(defaultOffers);
      console.log('🌱 Offres seedées automatiquement');
    }

    res.status(200).json(offers);
  } catch (error) {
    // On inclut `error` dans la réponse — pratique en développement,
    // mais à restreindre en production pour ne pas exposer les détails internes.
    // Envisager : `process.env.NODE_ENV === 'production' ? {} : error`
    res.status(500).json({ message: 'Erreur lors de la récupération des offres.', error });
  }
};