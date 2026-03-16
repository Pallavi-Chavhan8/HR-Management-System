const mongoose = require("mongoose");

const { Employee } = require("../models/Employee.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const normalizeString = (value) => (typeof value === "string" ? value.trim() : undefined);

const normalizeEmail = (value) => {
  const normalizedValue = normalizeString(value);
  return normalizedValue ? normalizedValue.toLowerCase() : undefined;
};

const normalizeStatus = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized === "active") {
    return "Active";
  }

  if (normalized === "inactive") {
    return "Inactive";
  }

  if (normalized === "on leave" || normalized === "on_leave" || normalized === "leave") {
    return "On Leave";
  }

  return value.trim();
};

const parseEmployeeDuplicateError = (error) => {
  if (error?.code !== 11000) {
    return null;
  }

  const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];

  if (duplicateField === "email") {
    return new ApiError(409, "Employee with this email already exists");
  }

  if (duplicateField === "employeeId") {
    return new ApiError(409, "Employee with this employeeId already exists");
  }

  return new ApiError(409, "Employee already exists");
};

const pickEmployeePayload = (body = {}) => ({
  employeeId: normalizeString(body.employeeId),
  name: normalizeString(body.name),
  email: normalizeEmail(body.email),
  phone: normalizeString(body.phone),
  dateOfBirth: body.dateOfBirth,
  department: normalizeString(body.department),
  designation: normalizeString(body.designation),
  basicSalary: body.basicSalary ?? body.salary,
  salary: body.salary ?? body.basicSalary,
  joiningDate: body.joiningDate,
  status: normalizeStatus(body.status)
});

const validateRequiredFields = (payload) => {
  const requiredFields = [
    "name",
    "email",
    "phone",
    "dateOfBirth",
    "department",
    "designation",
    "salary",
    "joiningDate"
  ];

  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === "");
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }
};

const addEmployee = asyncHandler(async (req, res) => {
  try {
    const payload = pickEmployeePayload(req.body);
    validateRequiredFields(payload);

    const duplicateConditions = [{ email: payload.email }];
    if (payload.employeeId) {
      duplicateConditions.push({ employeeId: payload.employeeId });
    }

    const existingEmployee = await Employee.findOne({ $or: duplicateConditions }).lean();
    if (existingEmployee) {
      return res.status(409).json({ message: "Record already exists" });
    }

    const employee = await Employee.create(payload);

    return res.status(201).json(new ApiResponse(201, "Employee created successfully", employee));
  } catch (error) {
    console.error("[employees:create] Failed to create employee", {
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseEmployeeDuplicateError(error);
    if (duplicateError) {
      return res.status(409).json({ message: "Record already exists" });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to create employee");
  }
});

const getAllEmployees = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, "Employees fetched successfully", employees));
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid employee id");
  }

  const employee = await Employee.findById(id).lean();

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  res.status(200).json(new ApiResponse(200, "Employee fetched successfully", employee));
});

const searchEmployees = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;

  if (!q.trim()) {
    throw new ApiError(400, "Search query 'q' is required");
  }

  const employees = await Employee.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { department: { $regex: q, $options: "i" } },
      { designation: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } }
    ]
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, "Employee search completed", employees));
});

const updateEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid employee id");
    }

    const payload = pickEmployeePayload(req.body);

    if (payload.email) {
      const existing = await Employee.findOne({ email: payload.email, _id: { $ne: id } }).lean();
      if (existing) {
        throw new ApiError(409, "Another employee with this email already exists");
      }
    }

    if (payload.employeeId) {
      const existingByEmployeeId = await Employee.findOne({ employeeId: payload.employeeId, _id: { $ne: id } }).lean();
      if (existingByEmployeeId) {
        throw new ApiError(409, "Another employee with this employeeId already exists");
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    }).lean();

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(new ApiResponse(200, "Employee updated successfully", employee));
  } catch (error) {
    console.error("[employees:update] Failed to update employee", {
      params: req.params,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseEmployeeDuplicateError(error);
    if (duplicateError) {
      throw duplicateError.message.includes("employeeId")
        ? new ApiError(409, "Another employee with this employeeId already exists")
        : new ApiError(409, "Another employee with this email already exists");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to update employee");
  }
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid employee id");
  }

  const employee = await Employee.findByIdAndDelete(id).lean();

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  res.status(200).json(new ApiResponse(200, "Employee deleted successfully", null));
});

module.exports = {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  searchEmployees,
  updateEmployee
};
