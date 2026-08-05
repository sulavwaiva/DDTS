const express = require("express");
const router = express.Router();
const districtController = require("../controllers/districtController");

router.get("/",                     districtController.getAllDistricts);
router.get("/:name/facilities",     districtController.getFacilities);
router.get("/:name",                districtController.getDistrictByName);

module.exports = router;