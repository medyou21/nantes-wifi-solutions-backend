import { Router } from 'express';
import { createContact, getContacts } from '../controllers/contact.controller';
import { validateContact } from '../middlewares/validation.middleware';

const router = Router();

router.post('/', validateContact, createContact);
router.get('/admin', getContacts); // À protéger avec un middleware auth en production

export default router;
