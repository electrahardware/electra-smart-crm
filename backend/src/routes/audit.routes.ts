import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller";
import { authorize, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", authorize("Owner", "Sales Manager"), getAuditLogs);

export default router;
