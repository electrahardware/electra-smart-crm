import { Router } from "express";

import {
  deleteBackup,
  downloadBackup,
  getBackupOverview,
  listBackupJobs,
  requestManualBackup,
  requestStagingRestore,
  confirmProductionRestore,
  listRestoreJobs,
  restoreWorkflowStart,
  restoreWorkflowReport,
  testDrive,
  updateBackupSettings,
  workflowReport,
  workflowStart,
} from "../controllers/backup.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/workflow/start", workflowStart);
router.post("/workflow/report", workflowReport);
router.post("/restore-workflow/start", restoreWorkflowStart);
router.post("/restore-workflow/report", restoreWorkflowReport);

router.use(requireAuth);
router.get("/", getBackupOverview);
router.patch("/settings", updateBackupSettings);
router.get("/jobs", listBackupJobs);
router.post("/manual", requestManualBackup);
router.get("/restore-jobs", listRestoreJobs);
router.post("/restore/staging", requestStagingRestore);
router.post("/restore/:id/confirm", confirmProductionRestore);
router.get("/:id/download", downloadBackup);
router.delete("/:id", deleteBackup);
router.post("/drive/test", testDrive);

export default router;
