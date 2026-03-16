const mongoose = require("mongoose");

const { env } = require("../config/env.js");
const { Admin } = require("../models/Admin.js");

const seedAdmin = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@hrms.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "HR Admin";

  await mongoose.connect(env.MONGO_URI);

  const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });

  if (existingAdmin) {
    console.log(`Admin already exists for ${adminEmail}`);
    await mongoose.disconnect();
    return;
  }

  await Admin.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: adminPassword,
    role: "ADMIN"
  });

  console.log(`Admin seeded successfully: ${adminEmail}`);
  await mongoose.disconnect();
};

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin:", error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
