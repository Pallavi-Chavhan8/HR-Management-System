const mongoose = require("mongoose");

const { Trainee } = require("../models/Trainee.js");
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

const parseTraineeDuplicateError = (error) => {
  if (error?.code !== 11000) {
    return null;
  }

  const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];

  if (duplicateField === "email") {
    return new ApiError(409, "Trainee with this email already exists");
  }

  if (duplicateField === "traineeId") {
    return new ApiError(409, "Trainee with this traineeId already exists");
  }

  return new ApiError(409, "Trainee already exists");
};

const pickTraineePayload = (body = {}) => ({
  traineeId: normalizeString(body.traineeId),
  name: normalizeString(body.name),
  email: normalizeEmail(body.email),
  phone: normalizeString(body.phone),
  dateOfBirth: body.dateOfBirth,
  department: normalizeString(body.department),
  course: normalizeString(body.course) || normalizeString(body.trainingProgram),
  internshipDuration: normalizeString(body.internshipDuration) || normalizeString(body.trainingDuration),
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
  const requiredFields = [
    "name",
    "email",
    "phone",
    "dateOfBirth",
    "department",
    "course",
    "internshipDuration",
    "startDate",
    "endDate"
  ];

  const missingFields = requiredFields.filter(
    (field) => payload[field] === undefined || payload[field] === ""
  );

  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
  }
};

const createTrainee = asyncHandler(async (req, res) => {
  try {
    const payload = pickTraineePayload(req.body);
    ensureEndDate(payload);
    if (!payload.status) {
      payload.status = "ACTIVE";
    }
    validateRequiredFields(payload);

    const duplicateConditions = [{ email: payload.email }];
    if (payload.traineeId) {
      duplicateConditions.push({ traineeId: payload.traineeId });
    }

    const existingTrainee = await Trainee.findOne({ $or: duplicateConditions }).lean();
    if (existingTrainee) {
      return res.status(409).json({ message: "Record already exists" });
    }

    const trainee = await Trainee.create(payload);

    return res.status(201).json(new ApiResponse(201, "Trainee created successfully", trainee));
  } catch (error) {
    console.error("[trainees:create] Failed to create trainee", {
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseTraineeDuplicateError(error);
    if (duplicateError) {
      return res.status(409).json({ message: "Record already exists" });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to create trainee");
  }
});

const getAllTrainees = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { course: { $regex: search, $options: "i" } },
          { trainingProgram: { $regex: search, $options: "i" } },
          { internshipDuration: { $regex: search, $options: "i" } },
          { trainingDuration: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const trainees = await Trainee.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, "Trainees fetched successfully", trainees));
});

const getTraineeCount = asyncHandler(async (_req, res) => {
  const totalTrainees = await Trainee.countDocuments({});
  res.status(200).json({
    success: true,
    totalTrainees,
  });
});

const getTraineeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid trainee id");
  }

  const trainee = await Trainee.findById(id).lean();

  if (!trainee) {
    throw new ApiError(404, "Trainee not found");
  }

  res.status(200).json(new ApiResponse(200, "Trainee fetched successfully", trainee));
});

const updateTrainee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid trainee id");
    }

    const payload = pickTraineePayload(req.body);
  ensureEndDate(payload);

    if (payload.email) {
      const existingTrainee = await Trainee.findOne({ email: payload.email, _id: { $ne: id } }).lean();
      if (existingTrainee) {
        throw new ApiError(409, "Another trainee with this email already exists");
      }
    }

    if (payload.traineeId) {
      const existingTraineeId = await Trainee.findOne({ traineeId: payload.traineeId, _id: { $ne: id } }).lean();
      if (existingTraineeId) {
        throw new ApiError(409, "Another trainee with this traineeId already exists");
      }
    }

    const trainee = await Trainee.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    }).lean();

    if (!trainee) {
      throw new ApiError(404, "Trainee not found");
    }

    return res.status(200).json(new ApiResponse(200, "Trainee updated successfully", trainee));
  } catch (error) {
    console.error("[trainees:update] Failed to update trainee", {
      params: req.params,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });

    const duplicateError = parseTraineeDuplicateError(error);
    if (duplicateError) {
      throw duplicateError.message.includes("traineeId")
        ? new ApiError(409, "Another trainee with this traineeId already exists")
        : new ApiError(409, "Another trainee with this email already exists");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to update trainee");
  }
});

const deleteTrainee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid trainee id");
  }

  const trainee = await Trainee.findByIdAndDelete(id).lean();

  if (!trainee) {
    throw new ApiError(404, "Trainee not found");
  }

  res.status(200).json(new ApiResponse(200, "Trainee deleted successfully", null));
});

module.exports = {
  createTrainee,
  deleteTrainee,
  getAllTrainees,
  getTraineeCount,
  getTraineeById,
  updateTrainee
};
