import "dotenv/config";
import http from "http";
import app from "./app.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Project from "./models/project.model.js";
import User from "./models/user.model.js";
import { generateContentService } from "./services/gemini.service.js";
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid project ID"));
    }

    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;
    socket.project = await Project.findById(projectId);
    next();
  } catch (error) {
    next(error);
  }
});

// AI response handler
const aiResponseHandler = async (aiMessage, prompt, socket) => {
  const response = await generateContentService(prompt);
  if (response.error) {
    socket.emit("project-message", {
      ...aiMessage,
      message: `Error: ${response.error}`,
    });
  } else {
    io.to(socket.roomId).emit("project-message", {
      ...aiMessage,
      message: response,
    });
  }
};

// Socket connection
io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("New client connected");
  if (!socket.project) {
    return socket.disconnect(); // or send an error message
  }
  socket.join(socket.roomId);
  // console.log("User joined room:", socket.roomId);
  socket.on("project-message", async (data) => {
    // console.log(data);
    const user = await User.findById(data.user);
    if (!user) {
      return socket.emit("error", "User not found");
    }
    const message = {
      message: data.message,
      user: {
        _id: user._id,
        email: user.email,
      },
      projectId: data.projectId,
    };

    if (data.message.includes("@AI")) {
      const aiMessage = {
        message: data.message,
        user: {
          _id: "AI",
          email: "AI",
        },
        projectId: data.projectId,
      };
      const cleanMessage = data.message.split("@AI")[1]?.trim() || "";
      if (!cleanMessage) {
        socket.emit("project-message", {
          ...aiMessage,
          message: "Please provide your query after using @AI",
        });
      } else {
        socket.emit("project-message", {
          ...aiMessage,
          message: `AI Processing your query...`,
        });
        aiResponseHandler(aiMessage, cleanMessage, socket);
      }
    }

    socket.broadcast.to(socket.roomId).emit("project-message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
