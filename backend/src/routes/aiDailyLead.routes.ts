import { Router } from "express";

import { completeAiDailyLead, getAiDailyLeadArchiveController, getAiDailyLeadConfig, getAiDailyLeadExecutives, getTodayAiDailyLeads, regenerateAiDailyLeadBatch, runScheduledAiDailyLeadGeneration, updateAiDailyLeadConfig, updateAiDailyLeadRules } from "../controllers/aiDailyLead.controller";
import { authorize, requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.post("/scheduled-generate", runScheduledAiDailyLeadGeneration);
router.use(requireAuth);

router.get("/", authorize("Owner", "Sales Manager", "Sales Executive"), getTodayAiDailyLeads);
router.get("/archive", authorize("Owner", "Sales Manager", "Sales Executive"), getAiDailyLeadArchiveController);
router.post("/items/:itemId/complete", authorize("Owner", "Sales Manager", "Sales Executive"), completeAiDailyLead);
router.get("/executives", authorize("Owner", "Sales Manager"), getAiDailyLeadExecutives);
router.post("/regenerate/:executiveId", authorize("Owner", "Sales Manager"), regenerateAiDailyLeadBatch);
router.get("/configuration", authorize("Owner"), getAiDailyLeadConfig);
router.put("/configuration", authorize("Owner"), updateAiDailyLeadConfig);
router.put("/configuration/rules", authorize("Owner"), updateAiDailyLeadRules);

export default router;
