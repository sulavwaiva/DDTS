require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./config/db"); // initializes DB connection pool
const districtRoutes = require("./routes/districtRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.use("/api/districts", districtRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});