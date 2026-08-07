import { Router } from "express";

import {
  getDuplicates,
} from "../controllers/duplicate.controller";
import { authorize, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, authorize("Owner", "Sales Manager"));

router.get(
  "/",
  getDuplicates
);

export default router;
