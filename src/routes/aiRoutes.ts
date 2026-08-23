import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { parseOrderTextItem } from "../validators/aiValidator";
import { parseOrderText } from "../controllers/aiController";


const router = Router();
// POST /api/ai/parse-order
router.post('/parse-order', protect, validate(parseOrderTextItem), parseOrderText);

export default router