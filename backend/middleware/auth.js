const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "M4y-S3cr3t-K3y-F0r-D3v";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid or user is inactive.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Authentication Error:", error.message);
    res.status(401).json({ success: false, message: "Token is not valid." });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = { generateToken, authenticate, authorize };
