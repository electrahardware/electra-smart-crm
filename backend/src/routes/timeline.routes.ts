import { Router } from "express";

import {
  getTimeline,
  addTimeline,
} from "../controllers/timeline.controller";

const router = Router();

router.get(
  "/:leadId",
  getTimeline
);

router.post(
  "/:leadId",
  addTimeline
);

export default router;