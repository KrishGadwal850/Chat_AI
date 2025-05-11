import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
const route = Router();

route.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be a valid password"),
  userController.createUserController
);

route.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be a valid password"),
  userController.loginController
);

route.get("/profile", authUserMiddleware, userController.profileController);

route.get("/logout", authUserMiddleware, userController.logoutController);

route.get(
  "/allUsers",
  authUserMiddleware,
  userController.getAllUsersController
);

export default route;
