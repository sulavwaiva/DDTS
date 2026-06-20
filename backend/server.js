const express = require("express");
const cors = require("cors");

const connection =require("./config/db");
const authRoutes = require("./routes/authRoutes");
const districtRoutes = require("./routes/districtRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/districts", districtRoutes);

// server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});