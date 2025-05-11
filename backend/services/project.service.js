import { mongoose } from "mongoose";
import ProjectModel from "../models/project.model.js";
import UserModel from "../models/user.model.js";
export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }
  if (!userId) {
    throw new Error("Id is required");
  }
  let project;
  try {
    project = await ProjectModel.create({ name, users: [userId] });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name must be unique");
    }
    throw new Error(error.message);
  }
  return project;
};

export const getProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  let projects;
  try {
    projects = await ProjectModel.find({ users: userId }).populate(
      "users",
      "-password"
    );
  } catch (error) {
    throw new Error(error.message);
  }
  return projects;
};

export const addUsersToProject = async (projectId, users, userId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }
  if (!users) {
    throw new Error("Users must be provided");
  }
  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }
  if (users.length === 0) {
    throw new Error("Users array cannot be empty");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  let UpdatedProject;
  console.log(projectId, " -> ", userId);
  try {
    const project = await ProjectModel.findOne({
      _id: projectId,
      // users: { $in: userId },
    });
    if (!project) {
      console.log(project);
      throw new Error("Project not found");
    }

    UpdatedProject = await ProjectModel.findByIdAndUpdate(
      { _id: projectId },
      {
        $addToSet: {
          users: {
            $each: users,
          },
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    throw new Error(error.message);
  }
  return UpdatedProject;
};

export const getProjectOne = async ({ email, projectId }) => {
  let project = null;
  try {
    if (!email) {
      throw new Error("Email is required");
    }
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid Project ID");
    }
    const loggedInUser = await UserModel.findOne({ email });
    const userId = loggedInUser._id;
    project = await ProjectModel.findOne({
      _id: projectId,
      users: userId,
    }).populate("users", "-password");
  } catch (error) {
    if (error instanceof mongoose.Error) {
      throw new Error("Invalid Project ID");
    }
    throw new Error(error.message);
  }
  return project;
};
