import * as userServices from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";
import userModel from "../models/user.model.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  try {
    const user = await userServices.createUser(req.body);
    const token = user.generateToken();
    delete user._doc.password;
    res.status(201).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  try {
    const { password, email } = req.body;
    const response = await userServices.userExists({ email, password });
    delete response.user._doc.password;
    console.log(response);
    res.status(200).json(response);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const profileController = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Not logged in");
    }
    redisClient.set(token, "logged out", "EX", 60 * 60 * 24);
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) {
      throw new Error("User not found");
    }
    const UserId = loggedInUser._id.toString();
    const users = await userServices.getAllUsers({ UserId });
    if (!users) {
      // throw new Error("No users found");
      res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
