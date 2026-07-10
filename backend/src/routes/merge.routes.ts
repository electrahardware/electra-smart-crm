import { Router } from "express";

import {
  mergeLead,
} from "../controllers/merge.controller";

const router = Router();

router.post(
  "/",
  mergeLead
);

export default router;