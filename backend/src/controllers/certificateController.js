const { Employee } = require("../models/Employee.js");
const { Intern } = require("../models/Intern.js");
const { Trainee } = require("../models/Trainee.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const COMPANY_NAME = process.env.COMPANY_NAME || "Shriram Solutions Pvt. Ltd.";

const buildLookupRegex = (id) => new RegExp(`^${String(id).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const toCertificatePayload = ({ role, record }) => {
  if (role === "Employee") {
    return {
      id: record.employeeId,
      name: record.name,
      role,
      department: record.department,
      startDate: normalizeDate(record.joiningDate),
      endDate: null,
      companyName: COMPANY_NAME,
      descriptionOfWork: `${record.name} worked as ${record.designation || "an employee"} in the ${record.department || "assigned"} department and consistently contributed to assigned responsibilities with professionalism.`
    };
  }

  if (role === "Intern") {
    return {
      id: record.internId,
      name: record.name,
      role,
      department: record.department,
      startDate: normalizeDate(record.startDate),
      endDate: normalizeDate(record.endDate),
      companyName: COMPANY_NAME,
      descriptionOfWork: `${record.name} successfully completed internship assignments in the ${record.department || "assigned"} department and demonstrated strong learning ability and teamwork.`
    };
  }

  return {
    id: record.traineeId,
    name: record.name,
    role: "Trainee",
    department: record.department,
    startDate: normalizeDate(record.startDate),
    endDate: normalizeDate(record.endDate),
    companyName: COMPANY_NAME,
    descriptionOfWork: `${record.name} completed the trainee program in the ${record.department || "assigned"} department and showed discipline, technical growth, and commitment throughout the tenure.`
  };
};

const lookupCertificateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (!normalizedId) {
    throw new ApiError(400, "ID is required");
  }

  const lookupRegex = buildLookupRegex(normalizedId);

  const [employee, intern, trainee] = await Promise.all([
    Employee.findOne({ employeeId: lookupRegex }).lean(),
    Intern.findOne({ internId: lookupRegex }).lean(),
    Trainee.findOne({ traineeId: lookupRegex }).lean()
  ]);

  if (employee) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Certificate data fetched successfully", toCertificatePayload({ role: "Employee", record: employee })));
  }

  if (intern) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Certificate data fetched successfully", toCertificatePayload({ role: "Intern", record: intern })));
  }

  if (trainee) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Certificate data fetched successfully", toCertificatePayload({ role: "Trainee", record: trainee })));
  }

  throw new ApiError(404, "No record found for this ID");
});

module.exports = {
  lookupCertificateById
};
