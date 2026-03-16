const mongoose = require("mongoose");

const { Intern } = require("../models/Intern.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const normalizeString = (value) => (typeof value === "string" ? value.trim() : undefined);

const normalizeEmail = (value) => {
  const normalizedValue = normalizeString(value);
  return normalizedValue ? normalizedValue.toLowerCase() : undefined;
};

const parseDurationMonths = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{1,2})\s*(month|months)$/i);
  if (!match) {
    return null;
  }

  const months = Number(match[1]);
  return Number.isInteger(months) && months > 0 ? months : null;
};

const calculateEndDate = (startDateValue, internshipDurationValue) => {
  const months = parseDurationMonths(internshipDurationValue);
  if (!months) {
    return undefined;
  }

  const startDate = new Date(startDateValue);
  if (Number.isNaN(startDate.getTime())) {
    return undefined;
  }

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
};

const parseInternDuplicateError = (error) => {
  if (error?.code !== 11000) {
    return null;
  }

  const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];

  if (duplicateField === "email") {
    return new ApiError(409, "Intern with this email already exists");
  }

  if (duplicateField === "internId") {
    return new ApiError(409, "Intern with this internId already exists");
  }

  return new ApiError(409, "Intern already exists");
};

const pickInternPayload = (body = {}) => ({
  internId: normalizeString(body.internId),
  name: normalizeString(body.name),
  email: normalizeEmail(body.email),
  phone: normalizeString(body.phone),
  dateOfBirth: body.dateOfBirth,
  department: normalizeString(body.department),
  course: normalizeString(body.course),
  internshipDuration: normalizeString(body.internshipDuration),
  startDate: body.startDate,
  endDate: body.endDate,
  status: typeof body.status === "string" ? body.status.trim().toUpperCase() : undefined
});

const ensureEndDate = (payload) => {
  if (payload.endDate) {
    return;
  }

  const computedEndDate = calculateEndDate(payload.startDate, payload.internshipDuration);
  if (computedEndDate) {
    payload.endDate = computedEndDate;
  }
};

const validateRequiredFields = (payload) => {
  const requiredFields = ["name", "email", "phone", "dateOfBirth", "department", "course", "internshipDuration", "startDate", "endDate"];

  const missingFields = requiredFields.filter(
    (field) => payload[field] === undefined || payload[field] === ""
  );

  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
  }
};

const addIntern = asyncHandler(async (req, res) => {
  try {
    const payload = pickInternPayload(req.body);
    ensureEndDate(payload);
    if (!payload.status) {
      payload.status = "ACTIVE";
    }
    validateRequiredFields(payload);

    const duplicateConditions = [{ email: payload.email }];
    if (payload.internId) {
      duplicateConditions.push({ internId: payload.internId });
    }

    const existingIntern = await Intern.findOne({ $or: duplicateConditions }).lean();
    if (existingIntern) {
      return res.status(409).json({ message: "Record already exists" });
    }

    const intern = await Intern.create(payload);

    return res.status(201).json(new ApiResponse(201, "Intern created successfully", intern));
  } catch (error) {
    console.error("[interns:create] Failed to create intern", {
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseInternDuplicateError(error);
    if (duplicateError) {
      return res.status(409).json({ message: "Record already exists" });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to create intern");
  }
});

const updateIntern = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid intern id");
    }

    const payload = pickInternPayload(req.body);
    ensureEndDate(payload);

    if (payload.email) {
      const existingIntern = await Intern.findOne({ email: payload.email, _id: { $ne: id } }).lean();
      if (existingIntern) {
        throw new ApiError(409, "Another intern with this email already exists");
      }
    }

    if (payload.internId) {
      const existingInternId = await Intern.findOne({ internId: payload.internId, _id: { $ne: id } }).lean();
      if (existingInternId) {
        throw new ApiError(409, "Another intern with this internId already exists");
      }
    }

    const intern = await Intern.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    }).lean();

    if (!intern) {
      throw new ApiError(404, "Intern not found");
    }

    return res.status(200).json(new ApiResponse(200, "Intern updated successfully", intern));
  } catch (error) {
    console.error("[interns:update] Failed to update intern", {
      params: req.params,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseInternDuplicateError(error);
    if (duplicateError) {
      throw duplicateError.message.includes("internId")
        ? new ApiError(409, "Another intern with this internId already exists")
        : new ApiError(409, "Another intern with this email already exists");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to update intern");
  }
});

const deleteIntern = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid intern id");
  }

  const intern = await Intern.findByIdAndDelete(id).lean();

  if (!intern) {
    throw new ApiError(404, "Intern not found");
  }

  res.status(200).json(new ApiResponse(200, "Intern deleted successfully", null));
});

const getAllInterns = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { course: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { internshipDuration: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const interns = await Intern.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, "Interns fetched successfully", interns));
});

const getInternById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid intern id");
  }

  const intern = await Intern.findById(id).lean();

  if (!intern) {
    throw new ApiError(404, "Intern not found");
  }

  res.status(200).json(new ApiResponse(200, "Intern fetched successfully", intern));
});

module.exports = { addIntern, deleteIntern, getAllInterns, getInternById, updateIntern };
