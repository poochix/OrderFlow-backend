import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createCustomerSchema } from "../validators/customerValidator";
import { createCustomer, getcustomer } from "../controllers/customerController";

const router = Router();
// order of middleware 
//protect : verify customer is authenticated using JWT
//valdiate: validate zod scehma for customer
//createCustomer
router.post('/create',protect, validate(createCustomerSchema), createCustomer );
router.get('/', protect, getcustomer)

export default router;