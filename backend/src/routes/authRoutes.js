const { Router } = require("express");

const { getAdminProfile, loginAdmin, logoutAdmin, registerAdmin } = require("../controllers/authController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/logout", protectAdmin, logoutAdmin);
router.get("/me", protectAdmin, getAdminProfile);

module.exports = router;
