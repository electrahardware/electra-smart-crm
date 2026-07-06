import { Router } from "express";
import {
  getLeadCalls,
  addLeadCall,
  deleteLeadCall,
} from "../controllers/call.controller";

const router = Router();

router.get("/:id", getLeadCalls);

router.post("/:id", addLeadCall);

router.delete("/:callId", deleteLeadCall);

export default router;