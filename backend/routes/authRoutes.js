const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");


router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.put("/change-password", verifyToken, authController.changePassword);

module.exports = router;