import { Router } from "express";

import {
  getTimeline,
  addTimeline,
} from "../controllers/timeline.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get(
  "/:leadId",
  getTimeline
);

router.post(
  "/:leadId",
  addTimeline
);

export default router;
