import {
  createProject,
  getProjects,
  addUsersToProject,
  getProjectOne,
} from "../services/project.service.js";
import UserModel from "../models/user.model.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const loggedInUser = await UserModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject = await createProject({ name, userId });
    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProjectsController = async (req, res) => {
  try {
    const loggedInUser = await UserModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    console.log(userId);
    let projects = await getProjects(userId);
    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }
    res.status(200).json(projects);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const email = req.user.email;
    const project = await getProjectOne({ email, projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { projectId, users } = req.body;
    const loggedInUser = await UserModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const UpdatedProject = await addUsersToProject(projectId, users, userId);
    console.log("Here is Error");
    if (!UpdatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(UpdatedProject);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
