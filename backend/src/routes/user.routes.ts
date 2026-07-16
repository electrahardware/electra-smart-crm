import { Router } from "express";
import {
  login,
  getUsers,
  createUser,
  updateUser,
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

export default router;