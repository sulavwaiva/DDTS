const express = require("express");
const router = express.Router();

const districtController = require("../controllers/districtController");

// GET district by name
router.get("/name/:name", districtController.getDistrictByName);

module.exports = router;