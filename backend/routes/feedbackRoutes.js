const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/",            verifyToken, checkRole("admin"), feedbackController.getAllFeedback);
router.get("/mine",        verifyToken,                     feedbackController.getMyFeedback);
router.get("/:id",         verifyToken,                     feedbackController.getFeedbackById);
router.post("/",           verifyToken,                     feedbackController.submitFeedback);
router.put("/:id/status",  verifyToken, checkRole("admin"), feedbackController.updateFeedbackStatus);

module.exports = router;