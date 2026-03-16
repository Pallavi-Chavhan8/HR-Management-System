const { Router } = require("express");

const {
  createSalary,
  deleteSalary,
  getSalaries,
  getSalaryById,
  updateSalary
} = require("../controllers/salaryController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);

router.get("/", getSalaries);
router.get("/:id", getSalaryById);
router.post("/", createSalary);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);

module.exports = router;
