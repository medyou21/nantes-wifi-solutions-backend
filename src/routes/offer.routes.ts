// Importation du Router d'Express pour créer des routes modulaires
import { Router } from 'express';

// Importation du contrôleur qui récupère la liste des offres
import {
  createOffer,
  deleteOffer,
  getAdminOffers,
  getOffers,
  updateOffer,
} from '../controllers/offer.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOfferSchema, updateOfferSchema } from '../validators/offer.validator';

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

/** CRUD PostgreSQL protégé, présenté dans le dashboard administrateur. */
router.get('/admin', protect, getAdminOffers);
router.post('/admin', protect, validate(createOfferSchema), createOffer);
router.put('/admin/:id', protect, validate(updateOfferSchema), updateOffer);
router.delete('/admin/:id', protect, deleteOffer);

/**
 * Export du router des offres
 * Utilisé dans le fichier principal (app.ts / server.ts)
 */
export default router;
