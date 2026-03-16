const { Router } = require("express");

const { getDashboardStats } = require("../controllers/dashboardController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.get("/stats", protectAdmin, getDashboardStats);

module.exports = router;
