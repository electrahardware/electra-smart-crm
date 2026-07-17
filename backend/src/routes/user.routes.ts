import { Router } from "express";

import {
  login,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

router.post(
  "/login",
  login
);

router.get(
  "/",
  getUsers
);

router.post(
  "/",
  createUser
);

router.put(
  "/:id",
  updateUser
);

router.patch(
  "/:id/password",
  resetPassword
);

router.patch(
  "/:id/status",
  toggleUserStatus
);

router.delete(
  "/:id",
  deleteUser
);

export default router;