import { Router } from "express";
import {
  adminLogin,
  getAdminContacts,
} from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", adminLogin);
router.get("/contacts", protect, getAdminContacts);

export default router;