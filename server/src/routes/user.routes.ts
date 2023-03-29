import { Router } from "express";
import * as userController from "../controllers/users.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.route("/signup").post(userController.signUp);
router.route("/login").post(userController.login);
router
  .route("/current-user")
  .get(requireAuth, userController.getAuthenticatedUser);
router.route("/logout").get(userController.logout);

export { router as userRoutes };
