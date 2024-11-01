// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const secretKey = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.jwt;
    console.log("token authMiddleware", token);
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, secretKey);

    // If token is valid, attach decoded user data to request object for further use
    req.user = decoded;

    // Call next middleware
    next();
  } catch (error) {
    console.log("authMiddleware", error);
    
    // If token is invalid, clear cookie and redirect
    res.clearCookie("jwt"); // Clear the cookie
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
