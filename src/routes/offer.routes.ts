import { Router } from 'express';
import { getOffers } from '../controllers/offer.controller';

const router = Router();

router.get('/', getOffers);

export default router;
