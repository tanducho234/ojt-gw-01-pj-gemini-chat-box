const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI, {
  autoSelectFamily: false,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const connectToDatabase = async () => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};
module.exports = connectToDatabase;
