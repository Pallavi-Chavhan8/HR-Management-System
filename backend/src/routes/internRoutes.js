const { Router } = require("express");

const {
  addIntern,
  deleteIntern,
  getAllInterns,
  getInternById,
  updateIntern
} = require("../controllers/internController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);

router.get("/", getAllInterns);
router.get("/:id", getInternById);
router.post("/", addIntern);
router.put("/:id", updateIntern);
router.delete("/:id", deleteIntern);

module.exports = router;
