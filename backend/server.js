require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit=require("express-rate-limit");

require("./config/db");

const authRoutes     = require("./routes/authRoutes");
const districtRoutes = require("./routes/districtRoutes");
const projectRoutes  = require("./routes/projectRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const helmet = require("helmet");

const app = express();

// ── Rate limiters ────────────────────────────────────────────

// Global: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth: 10 requests per 15 minutes per IP (stricter — prevents brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(cors());
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({ extended: true, limit: "10kb"}));
app.use(helmet());

//routes
app.use("/api/auth", authLimiter,   authRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/projects",  projectRoutes);
app.use("/api/feedback",  feedbackRoutes);

//handlers
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});