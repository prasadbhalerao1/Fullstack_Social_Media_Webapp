import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.split(" ")[1]; // [Bearer tokenkjjfkjkjhskhsksample] Token on 1st index
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication Middleware error : " + error.message,
    });
  }
};
