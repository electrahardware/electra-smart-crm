import { Router } from "express";
import { authorize, requireAuth } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

import {
  createUser,
  deleteUser,
  getUsers,
  login,
  resetPassword,
  toggleUserStatus,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

/* --------------------------------------------------
   Public
--------------------------------------------------- */

router.post("/login", loginLimiter, login);

/* --------------------------------------------------
   Authentication
--------------------------------------------------- */

router.use(requireAuth);

/* --------------------------------------------------
   User Management (Owner Only)
--------------------------------------------------- */

router.get("/", authorize("Owner"), getUsers);

router.post("/", authorize("Owner"), createUser);

router.put("/:id", authorize("Owner"), updateUser);

router.patch("/:id/password", authorize("Owner"), resetPassword);

router.patch("/:id/status", authorize("Owner"), toggleUserStatus);

router.delete("/:id", authorize("Owner"), deleteUser);

export default router;
