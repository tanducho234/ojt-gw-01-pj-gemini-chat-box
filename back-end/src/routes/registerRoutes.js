const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Register a new user
router.post("/", userController.register);

// router.get("/verify/:token", userController.verify);

module.exports = router;
