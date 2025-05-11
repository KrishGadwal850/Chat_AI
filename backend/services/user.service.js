import userModel from "../models/user.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const hashedPassword = await userModel.hashPassword(password);
  const user = await userModel.create({
    email,
    password: hashedPassword,
  });
  return user;
};

export const userExists = async ({ email, password }) => {
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const match = await user.comparePassword(password);
  console.log(match);
  if (!match) {
    throw new Error("Invalid Credentials");
  }
  const token = user.generateToken();
  return { user, token };
};

export const getAllUsers = async ({ UserId }) => {
  const users = await userModel.find({ _id: { $ne: UserId } });
  return users;
};
