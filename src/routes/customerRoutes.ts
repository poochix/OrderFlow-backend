import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createCustomerSchema } from "../validators/customerValidator";
import { createCustomer } from "../controllers/customerController";

const router = Router();
// order of middleware 
//protect : verify customer is authenticated using JWT
//valdiate: validate zod scehma for customer
//createCustomer
router.post('/create',protect, validate(createCustomerSchema), createCustomer )

export default router;