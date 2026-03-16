const { Department } = require("../models/Department.js");
const { Employee } = require("../models/Employee.js");
const { Intern } = require("../models/Intern.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [employeeStats, internStats, departmentStats] = await Promise.all([
    Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalSalaryExpense: { $sum: "$salary" }
        }
      }
    ]),
    Intern.aggregate([{ $count: "totalInterns" }]),
    Department.aggregate([{ $count: "totalDepartments" }])
  ]);

  const stats = {
    totalEmployees: employeeStats[0]?.totalEmployees || 0,
    totalInterns: internStats[0]?.totalInterns || 0,
    totalDepartments: departmentStats[0]?.totalDepartments || 0,
    totalSalaryExpense: employeeStats[0]?.totalSalaryExpense || 0
  };

  res.status(200).json(new ApiResponse(200, "Dashboard statistics fetched successfully", stats));
});

module.exports = { getDashboardStats };
