import { Router } from "express";
import validate from "../middleware/validate";
import { registerSchema } from "../validators/authValidator";
import { getMe, loginUser, registerUser } from "../controllers/authController";
import { loginSchema } from "../validators/loginValidator";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Defined POST /api/auth/register route
// Validate(registerSchema) runs before register user for validation
router.post('/register', validate(registerSchema), registerUser );
router.post("/login", validate(loginSchema), loginUser);

// GET /api/auth/me
router.get('/me', protect, getMe);

export default router