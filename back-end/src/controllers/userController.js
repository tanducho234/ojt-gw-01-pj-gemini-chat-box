//userController
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const errorHandler = require("../utils/errorHandler");
const dotenv = require("dotenv");

dotenv.config();
const secretKey = process.env.JWT_SECRET;

module.exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the user by email
    const candidate = await User.findOne({ email });
    if (!candidate) {
      return res.status(401).json({
        message: "User with this email not found",
      });
    }

    // Compare the password
    const passwordResult = await bcrypt.compare(password, candidate.password);
    if (!passwordResult) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        email: candidate.email,
        userId: candidate._id,
      },
      secretKey,
      { expiresIn: "12h" }
    );

    // Save token to cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 12 * 3600 * 1000,
      secure: true,
      sameSite: "None",
    });

    // Respond with the token
    res.status(200).json({
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports.register = async function (req, res) {
  console.log(req.body.email);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  const candidate = await User.findOne({ email: req.body.email });
  if (candidate) {
    res.status(409).json({
      message: "This email is already in use",
    });
  } else {
    const salt = bcrypt.genSaltSync(10);
    const password = req.body.password;
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt),
      fullName: req.body.fullName,
    });
    try {
      await user.save();
      res.status(201).json(user);
    } catch (e) {
      errorHandler(res, e);
    }
  }
};
module.exports.getProfile = async function (req, res) {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Authorization failed" });
    }

    // Verify token and extract userId
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (e) {
    errorHandler(res, e);
  }
};
// Update user profile function
module.exports.updateProfile = async function (req, res) {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Authorization failed" });
    }

    // Verify token and extract userId
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update full name if provided
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }

    // Update password if provided
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(req.body.password, salt);
    }

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (e) {
    errorHandler(res, e);
  }
};
