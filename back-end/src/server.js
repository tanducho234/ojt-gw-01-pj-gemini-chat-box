// server.js
const express = require("express");
const path = require("path");
const routes = require("./routes");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");

const PORT = process.env.PORT || 3000;
process.env.TZ = "Asia/Ho_Chi_Minh";

app.use(cors({
  origin: 'http://127.0.0.1:5500',  // Replace with your frontend origin
  credentials: true                // Allow cookies and other credentials
}));
// Middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
//cookies
var cookieParser = require("cookie-parser");

app.use(cookieParser());

// Connect to MongoDB
const connectToDatabase = require("../config/database");
connectToDatabase();

app.use(express.json());

// Routes
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
