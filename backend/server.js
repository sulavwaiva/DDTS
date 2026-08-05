require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes     = require("./routes/authRoutes");
const districtRoutes = require("./routes/districtRoutes");
const projectRoutes  = require("./routes/projectRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",      authRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/projects",  projectRoutes);
app.use("/api/feedback",  feedbackRoutes);

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