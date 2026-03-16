const { Router } = require("express");

const {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment
} = require("../controllers/departmentController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);

router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;
