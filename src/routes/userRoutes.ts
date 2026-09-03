import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { getUser } from "../controllers/userController";


const router =  Router();

router.get("/get", protect, getUser );

export default router ;
