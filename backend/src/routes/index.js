const { Router } = require("express");

const authRoutes = require("./authRoutes.js");
const certificateRoutes = require("./certificateRoutes.js");
const dashboardRoutes = require("./dashboardRoutes.js");
const employeeRoutes = require("./employeeRoutes.js");
const internRoutes = require("./internRoutes.js");
const salaryRoutes = require("./salaryRoutes.js");
const traineeRoutes = require("./traineeRoutes.js");

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ message: "HRMS API v1" });
});

router.use("/auth", authRoutes);
router.use("/certificates", certificateRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/employees", employeeRoutes);
router.use("/interns", internRoutes);
router.use("/salary", salaryRoutes);
router.use("/salaries", salaryRoutes);
router.use("/trainees", traineeRoutes);

module.exports = router;
