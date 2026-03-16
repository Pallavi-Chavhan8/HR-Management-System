const mongoose = require("mongoose");

const { Employee } = require("../models/Employee.js");
const { Salary } = require("../models/Salary.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const mapSalaryResponse = (salary) => ({
  _id: salary._id,
  employeeId: salary.employeeId?._id || salary.employeeId,
  employee: salary.employeeId && typeof salary.employeeId === "object"
    ? {
        _id: salary.employeeId._id,
        employeeId: salary.employeeId.employeeId,
        name: salary.employeeId.name,
        email: salary.employeeId.email,
        department: salary.employeeId.department,
        designation: salary.employeeId.designation
      }
    : null,
  basicSalary: salary.basicSalary,
  bonus: salary.bonus,
  deductions: salary.deductions,
  netSalary: salary.netSalary,
  paymentDate: salary.paymentDate,
  createdAt: salary.createdAt,
  updatedAt: salary.updatedAt
});

const normalizeSalaryPayload = (body = {}) => ({
  employeeId: typeof body.employeeId === "string" ? body.employeeId.trim() : body.employeeId,
  bonus: body.bonus,
  deductions: body.deductions,
  paymentDate: body.paymentDate
});

const createSalary = asyncHandler(async (req, res) => {
  const payload = normalizeSalaryPayload(req.body);

  if (!payload.employeeId) {
    throw new ApiError(400, "employeeId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(payload.employeeId)) {
    throw new ApiError(400, "Invalid employee id");
  }

  const bonus = payload.bonus === undefined || payload.bonus === "" ? 0 : Number(payload.bonus);
  const deductions = payload.deductions === undefined || payload.deductions === "" ? 0 : Number(payload.deductions);

  if (Number.isNaN(bonus) || bonus < 0) {
    throw new ApiError(400, "bonus cannot be negative");
  }

  if (Number.isNaN(deductions) || deductions < 0) {
    throw new ApiError(400, "deductions cannot be negative");
  }

  if (!payload.paymentDate) {
    throw new ApiError(400, "paymentDate is required");
  }

  const employee = await Employee.findById(payload.employeeId).lean();
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const basicSalary = Number(employee.salary);
  if (Number.isNaN(basicSalary) || basicSalary <= 0) {
    throw new ApiError(400, "Selected employee does not have a valid basic salary");
  }

  const salary = await Salary.create({
    employeeId: payload.employeeId,
    basicSalary,
    bonus,
    deductions,
    paymentDate: payload.paymentDate
  });

  const createdSalary = await Salary.findById(salary._id)
    .populate("employeeId", "employeeId name email department designation")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, "Salary record created successfully", mapSalaryResponse(createdSalary)));
});

const getSalaries = asyncHandler(async (_req, res) => {
  const salaries = await Salary.find()
    .sort({ paymentDate: -1, createdAt: -1 })
    .populate("employeeId", "employeeId name email department designation")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Salary records fetched successfully", salaries.map(mapSalaryResponse)));
});

const getSalaryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid salary id");
  }

  const salary = await Salary.findById(id)
    .populate("employeeId", "employeeId name email department designation")
    .lean();

  if (!salary) {
    throw new ApiError(404, "Salary record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Salary record fetched successfully", mapSalaryResponse(salary)));
});

const updateSalary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid salary id");
  }

  const existingSalary = await Salary.findById(id).lean();
  if (!existingSalary) {
    throw new ApiError(404, "Salary record not found");
  }

  const payload = normalizeSalaryPayload(req.body);

  const effectiveEmployeeId = payload.employeeId || String(existingSalary.employeeId);
  if (!mongoose.Types.ObjectId.isValid(effectiveEmployeeId)) {
    throw new ApiError(400, "Invalid employee id");
  }

  const employee = await Employee.findById(effectiveEmployeeId).lean();
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const basicSalary = Number(employee.salary);
  if (Number.isNaN(basicSalary) || basicSalary <= 0) {
    throw new ApiError(400, "Selected employee does not have a valid basic salary");
  }

  const bonus = payload.bonus === undefined || payload.bonus === ""
    ? Number(existingSalary.bonus || 0)
    : Number(payload.bonus);
  const deductions = payload.deductions === undefined || payload.deductions === ""
    ? Number(existingSalary.deductions || 0)
    : Number(payload.deductions);

  if (Number.isNaN(bonus) || bonus < 0) {
    throw new ApiError(400, "bonus cannot be negative");
  }

  if (Number.isNaN(deductions) || deductions < 0) {
    throw new ApiError(400, "deductions cannot be negative");
  }

  const paymentDate = payload.paymentDate || existingSalary.paymentDate;
  if (!paymentDate) {
    throw new ApiError(400, "paymentDate is required");
  }

  const netSalary = basicSalary + bonus - deductions;
  if (netSalary < 0) {
    throw new ApiError(400, "netSalary cannot be negative");
  }

  const salary = await Salary.findByIdAndUpdate(
    id,
    {
      employeeId: effectiveEmployeeId,
      basicSalary,
      bonus,
      deductions,
      paymentDate,
      netSalary
    },
    { new: true, runValidators: true }
  )
    .populate("employeeId", "employeeId name email department designation")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Salary record updated successfully", mapSalaryResponse(salary)));
});

const deleteSalary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid salary id");
  }

  const deletedSalary = await Salary.findByIdAndDelete(id).lean();

  if (!deletedSalary) {
    throw new ApiError(404, "Salary record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Salary record deleted successfully", null));
});

module.exports = {
  createSalary,
  deleteSalary,
  getSalaries,
  getSalaryById,
  updateSalary
};
