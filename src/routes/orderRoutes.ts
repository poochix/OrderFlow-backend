import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createOrderSchema } from "../validators/orderValidator";
import { createOrder } from "../controllers/orderController";

const router = Router()
//protect: check authentication
//validate checks zod schema
//create order create new order

router.post('/create', protect, validate(createOrderSchema), createOrder);

export default router;