import { Router } from "express";
import { createContact } from "../controllers/contact.controller";
import { validate }       from "../middlewares/validate.middleware";
import { contactSchema }  from "../validators/contact.validator";
import { contactLimiter } from "../config/rateLimit.config";

const router = Router();

router.post(
  "/",
  contactLimiter,          // ✅ max 5 envois / heure / IP
  validate(contactSchema), // ✅ validation + sanitize Zod
  createContact
);

export default router;