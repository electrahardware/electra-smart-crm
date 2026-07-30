import { Router } from "express";

import { authorize, requireAuth } from "../middleware/auth.middleware";

import { getActivities } from "../controllers/activity.controller";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getActivities,
);

export default router;
