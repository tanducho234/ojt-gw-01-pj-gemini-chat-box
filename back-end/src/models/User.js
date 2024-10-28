// models/users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  bio: String,
  registrationDate: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;