import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createOrderSchema } from "../validators/orderValidator";
import { createOrder, getOrders } from "../controllers/orderController";

const router = Router()
//protect: check authentication
//validate checks zod schema
//create order create new order

//create new orders
router.post('/create', protect, validate(createOrderSchema), createOrder);
//  fetch all orders (with pagination and filters)
router.post('/getOrders', protect, getOrders);

export default router;