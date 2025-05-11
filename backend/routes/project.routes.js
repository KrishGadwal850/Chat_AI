import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import { authUserMiddleware } from "../middleware/auth.middleware.js";
const route = Router();

route.post(
  "/createProject",
  authUserMiddleware,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectController
);

route.get(
  "/getProjects",
  authUserMiddleware,
  projectController.getProjectsController
);

route.get(
  "/getProject/:projectId",
  authUserMiddleware,
  projectController.getProjectById
);

route.put(
  "/addUser",
  authUserMiddleware,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array")
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProjectController
);

export default route;
