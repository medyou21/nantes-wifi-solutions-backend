import { Request, Response } from 'express';
import Offer from '../models/offer.model';

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

export const getOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    let offers = await Offer.find();

    // Seed automatique si aucune offre en base
    if (offers.length === 0) {
      offers = await Offer.insertMany(defaultOffers);
      console.log('🌱 Offres seedées automatiquement');
    }

    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des offres.', error });
  }
};
