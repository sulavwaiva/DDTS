const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/",                                          projectController.getAllProjects);
router.get("/:id",                                        projectController.getProjectById);
router.post("/",      verifyToken, checkRole("admin"),   projectController.createProject);
router.put("/:id",    verifyToken, checkRole("admin"),   projectController.updateProject);
router.delete("/:id", verifyToken, checkRole("admin"),   projectController.deleteProject);

module.exports = router;