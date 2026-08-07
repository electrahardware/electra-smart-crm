import { Router } from "express";
import {
  getLeadCalls,
  addLeadCall,
  deleteLeadCall,
} from "../controllers/call.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/:id", getLeadCalls);

router.post("/:id", addLeadCall);

router.delete("/:callId", deleteLeadCall);

export default router;
