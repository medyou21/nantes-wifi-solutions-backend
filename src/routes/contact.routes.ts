import { Router } from 'express';
import { createContact, getContacts } from '../controllers/contact.controller';
import { validateContact } from '../middlewares/validation.middleware';

const router = Router();

router.post('/', validateContact, createContact);

// ⚠️ À sécuriser avec auth plus tard
router.get('/admin', getContacts);

export default router;