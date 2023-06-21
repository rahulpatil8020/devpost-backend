import { Router } from "express";
import {
  getUser,
  updateUser,
  deleteUser,
  login,
  signup,
  subscribe,
  unsubscribe,
} from "../controllers/userController.js";

const router = Router();

router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.patch("/:id/subscribe", subscribe);
router.patch("/:id/unsubscribe", unsubscribe);
router.post("/login", login);
router.post("/signup", signup);

export default router;
