import { Router } from "express";

import {
  getDuplicates,
} from "../controllers/duplicate.controller";

const router = Router();

router.get(
  "/",
  getDuplicates
);

export default router;