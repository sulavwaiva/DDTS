const express = require("express");
const router = express.Router();
const facilityController = require("../controllers/facilityController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/",                 facilityController.getAllFacilities);
router.get("/district/:name",   facilityController.getFacilitiesByDistrictName);
router.get("/:id",              facilityController.getFacilityById);
router.post("/",                verifyToken, checkRole("admin"), facilityController.createFacility);
router.put("/:id",               verifyToken, checkRole("admin"), facilityController.updateFacility);
router.delete("/:id",           verifyToken, checkRole("admin"), facilityController.deleteFacility);

module.exports = router;