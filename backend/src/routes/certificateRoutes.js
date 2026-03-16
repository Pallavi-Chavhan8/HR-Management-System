const { Router } = require("express");

const { lookupCertificateById } = require("../controllers/certificateController.js");
const { protectAdmin } = require("../middleware/authMiddleware.js");

const router = Router();

router.use(protectAdmin);
router.get("/lookup/:id", lookupCertificateById);

module.exports = router;
