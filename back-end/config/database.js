const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ChatSession = require('../../back-end/src/models/ChatSession');

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      autoSelectFamily: false,
    });
    console.log("Connected to MongoDB with Mongoose");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};
module.exports = connectToDatabase;
