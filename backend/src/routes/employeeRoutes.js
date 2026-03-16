const { Router } = require("express");

const {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  searchEmployees,
  updateEmployee
} = require("../controllers/employeeController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);

router.get("/", getAllEmployees);
router.get("/search", searchEmployees);
router.get("/:id", getEmployeeById);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
