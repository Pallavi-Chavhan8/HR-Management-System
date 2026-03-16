const { Router } = require("express");

const {
  createTrainee,
  deleteTrainee,
  getAllTrainees,
  getTraineeCount,
  getTraineeById,
  updateTrainee
} = require("../controllers/traineeController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);

router.get("/", getAllTrainees);
router.get("/count", getTraineeCount);
router.get("/:id", getTraineeById);
router.post("/", createTrainee);
router.put("/:id", updateTrainee);
router.delete("/:id", deleteTrainee);

module.exports = router;
