import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { getManagerAnalytics } from "../controllers/analyticsController";


const router = Router();
// GET /api/analytics/dashboard
router.get('/dashboard', protect, restrictTo('admin','manager'), getManagerAnalytics);

export default router