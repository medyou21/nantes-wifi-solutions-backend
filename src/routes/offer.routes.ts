// Importation du Router d'Express pour créer des routes modulaires
import { Router } from 'express';

// Importation du contrôleur qui récupère la liste des offres
import { getOffers } from '../controllers/offer.controller';

// Création d'une instance de router Express
const router = Router();

/**
 * Route GET /
 * Permet de récupérer toutes les offres disponibles
 *
 * Exemple d'utilisation :
 * GET /offers
 *
 * Réponse attendue :
 * - liste des offres (title, price, description, features)
 */
router.get('/', getOffers);

/**
 * Export du router des offres
 * Utilisé dans le fichier principal (app.ts / server.ts)
 */
export default router;