import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { getAuditLogs } from "../controllers/auditLog";


const router = Router()

// GET /api/audit-logs/:entityId
router.get('/:entityId', protect, getAuditLogs);

export default router
