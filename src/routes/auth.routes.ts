import { Router } from "express";
import { login }        from "../controllers/auth.controller";
import { validate }     from "../middlewares/validate.middleware";
import { loginSchema }  from "../validators/auth.validator";
import { authLimiter }  from "../config/rateLimit.config";

const router = Router();

router.post(
  "/login",
  authLimiter,           // ✅ max 10 tentatives / 15 min / IP
  validate(loginSchema), // ✅ validation
  login
);

export default router;