const jwt = require("jsonwebtoken");

const { env } = require("../config/env.js");
const { ROLES } = require("../constants/roles.js");
const { User } = require("../models/User.js");
const { Admin } = require("../models/Admin.js");
const { ApiError } = require("../utils/ApiError.js");

const protectAdmin = async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (!env.JWT_SECRET) {
    return next(new ApiError(500, "JWT secret is not configured"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.role !== ROLES.ADMIN) {
      return next(new ApiError(403, "Admin access required"));
    }

    let admin = await User.findById(decoded.id).select("-password");
    if (!admin) {
      admin = await Admin.findById(decoded.id).select("-password");
    }

    if (!admin) {
      return next(new ApiError(401, "Admin account no longer exists"));
    }

    req.user = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (_error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = { protectAdmin };
