const mongoose = require("mongoose");

const { env } = require("../src/config/env.js");

const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const connection = await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB connected successfully", {
    database: connection.connection.name,
    host: connection.connection.host,
    port: connection.connection.port
  });
};

module.exports = { connectDB };
