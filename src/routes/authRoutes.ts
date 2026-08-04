import { Router } from "express";
import validate from "../middleware/validate";
import { registerSchema } from "../validators/authValidator";
import { loginUser, registerUser } from "../controllers/authController";
import { loginSchema } from "../validators/loginValidator";

const router = Router();

// Defined POST /api/auth/register route
// Validate(registerSchema) runs before register user for validation
router.post('/register', validate(registerSchema), registerUser );
router.post("/login", validate(loginSchema), loginUser);

export default router