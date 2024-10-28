// server.js
const express = require("express");
const path = require("path");
const routes = require("./routes");
const app = express();
const dotenv = require("dotenv");

const PORT = process.env.PORT || 3000;
process.env.TZ = "Asia/Ho_Chi_Minh";

// Middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Connect to MongoDB
const connectToDatabase = require("../config/database");
connectToDatabase();

app.use(express.json());

// Routes
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
