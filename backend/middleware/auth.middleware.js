import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
export const authUserMiddleware = async (req, res, next) => {
  //   console.log("entered");
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized Access" });
    }
    const blacklisted = await redisClient.get(token);
    if (blacklisted) {
      res.cookies.token = null;
      return res.status(401).json({ error: "Unauthorized Access" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized Access" });
  }
};
