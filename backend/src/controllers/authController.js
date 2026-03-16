const jwt = require("jsonwebtoken");

const { env } = require("../config/env.js");
const { User } = require("../models/User.js");
const { Admin } = require("../models/Admin.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const generateToken = (user) => {
  if (!env.JWT_SECRET) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeEmail = (value) => normalizeString(value).toLowerCase();

const registerAdmin = asyncHandler(async (req, res) => {
  const name = normalizeString(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = normalizeString(req.body?.password);

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (name.length < 3) {
    throw new ApiError(400, "Name must be at least 3 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Enter a valid email address");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email }).lean();
  const existingAdmin = await Admin.findOne({ email }).lean();
  if (existingUser || existingAdmin) {
    throw new ApiError(409, "Admin with this email already exists");
  }

  let user;
  try {
    user = await User.create({
      name,
      email,
      password,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Admin with this email already exists");
    }

    throw error;
  }

  res.status(201).json(
    new ApiResponse(201, "Admin registration successful", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = normalizeString(req.body?.password);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  let account = await User.findOne({ email }).select("+password");
  if (!account) {
    account = await Admin.findOne({ email }).select("+password");
  }

  if (!account) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await account.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(account);

  res.status(200).json(
    new ApiResponse(200, "Admin login successful", {
      token,
      admin: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role
      }
    })
  );
});

const getAdminProfile = asyncHandler(async (req, res) => {
  let admin = await User.findById(req.user.id).select("-password");
  if (!admin) {
    admin = await Admin.findById(req.user.id).select("-password");
  }

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  res.status(200).json(new ApiResponse(200, "Admin profile fetched", admin));
});

const logoutAdmin = asyncHandler(async (_req, res) => {
  res.status(200).json(new ApiResponse(200, "Admin logout successful", null));
});

module.exports = { getAdminProfile, loginAdmin, logoutAdmin, registerAdmin };
