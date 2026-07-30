import { Router } from "express";

import { authorize, requireAuth } from "../middleware/auth.middleware";

import {
  commitLeadImport,
  previewLeadImport,
} from "../controllers/import.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/leads/preview",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  previewLeadImport,
);

router.post(
  "/leads/commit",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  commitLeadImport,
);

export default router;
