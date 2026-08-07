import { Router } from "express";

import {
  mergeLead,
} from "../controllers/merge.controller";
import { authorize, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, authorize("Owner", "Sales Manager"));

router.post(
  "/",
  mergeLead
);

export default router;
