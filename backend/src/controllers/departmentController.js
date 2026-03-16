const mongoose = require("mongoose");

const { Department } = require("../models/Department.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const mapDepartmentResponse = (department) => ({
  _id: department._id,
  id: department._id,
  name: department.departmentName,
  departmentName: department.departmentName,
  description: department.description,
  createdAt: department.createdAt,
  updatedAt: department.updatedAt
});

const normalizeDepartmentPayload = (body = {}) => {
  const departmentName = typeof body.departmentName === "string" ? body.departmentName.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  return { departmentName, description };
};

const createDepartment = asyncHandler(async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      throw new ApiError(400, "Invalid request body");
    }

    const { departmentName, description } = normalizeDepartmentPayload(req.body);

    if (!departmentName) {
      throw new ApiError(400, "departmentName is required");
    }

    const existingDepartment = await Department.findOne({ departmentName }).lean();
    if (existingDepartment) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      departmentName,
      description,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Department created successfully", mapDepartmentResponse(department)));
  } catch (error) {
    console.error("[departments:create] Failed to create department", {
      body: req.body,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern || null,
      keyValue: error.keyValue || null,
      stack: error.stack,
    });

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];

      if (duplicateField === "departmentName") {
        return res.status(409).json({ message: "Department already exists" });
      }

      throw new ApiError(500, "Unexpected unique index conflict. Please review collection indexes.");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to create department");
  }
});

const addDepartment = createDepartment;

const updateDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid department id");
    }

    if (req.body.departmentName !== undefined) {
      const departmentName = typeof req.body.departmentName === "string"
        ? req.body.departmentName.trim()
        : "";

      if (!departmentName) {
        throw new ApiError(400, "departmentName cannot be empty");
      }

      const existing = await Department.findOne({ departmentName, _id: { $ne: id } }).lean();
      if (existing) {
        throw new ApiError(409, "Another department with this name already exists");
      }

      updatePayload.departmentName = departmentName;
    }

    if (req.body.description !== undefined) {
      updatePayload.description = typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";
    }

    const department = await Department.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true
    }).lean();

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Department updated successfully", mapDepartmentResponse(department)));
  } catch (error) {
    console.error("[departments:update] Failed to update department", {
      params: req.params,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    if (error.code === 11000) {
      throw new ApiError(409, "Another department with this name already exists");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to update department");
  }
});

const deleteDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid department id");
    }

    const department = await Department.findByIdAndDelete(id).lean();

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    return res.status(200).json(new ApiResponse(200, "Department deleted successfully", null));
  } catch (error) {
    console.error("[departments:delete] Failed to delete department", {
      params: req.params,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to delete department");
  }
});

const getAllDepartments = asyncHandler(async (_req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 }).lean();
    const response = departments.map(mapDepartmentResponse);

    return res.status(200).json(new ApiResponse(200, "Departments fetched successfully", response));
  } catch (error) {
    console.error("[departments:list] Failed to fetch departments", {
      message: error.message,
      stack: error.stack,
    });

    throw new ApiError(500, "Failed to fetch departments");
  }
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid department id");
  }

  const department = await Department.findById(id).lean();

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Department fetched successfully", mapDepartmentResponse(department)));
});

module.exports = {
  addDepartment,
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment
};
