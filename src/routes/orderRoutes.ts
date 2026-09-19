import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { createOrderSchema, editOrderSchema, updateOrderStatusSchema } from "../validators/orderValidator";
import { createOrder, dispatch, editOrder, getOrders, updateOrderStatus } from "../controllers/orderController";

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

//patch api/orders/:orderId - updates the edit field 
router.patch("/:orderId", protect, validate(editOrderSchema), editOrder)

export default router;