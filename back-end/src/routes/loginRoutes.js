// routes/loginroutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Login user and get JWT token
router.post("/", userController.login);

module.exports = router;
