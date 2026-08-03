import { Router } from "express";
import validate from "../middleware/validate";
import { registerSchema } from "../validators/authValidator";
import { registerUser } from "../controllers/authController";

const router = Router();

// Defined POST /api/auth/register route
// Validate(registerSchema) runs before register user for validation
router.post('/register', validate(registerSchema), registerUser );


export default router