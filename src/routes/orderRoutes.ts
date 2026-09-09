import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidator";
import { createOrder, dispatch, getOrders, updateOrderStatus } from "../controllers/orderController";

const router = Router()
//protect: check authentication
//validate checks zod schema
//create order create new order

//create new orders
router.post('/create', protect, validate(createOrderSchema), createOrder);
router.post('/:orderId/dispatch', protect, dispatch)


//  fetch all orders (with pagination and filters)
router.get('/getOrders', protect, getOrders);


//Patch /api/orders/:id/status - Update order work flow state
router.patch('/:id/status', protect, validate(updateOrderStatusSchema), updateOrderStatus);



export default router;