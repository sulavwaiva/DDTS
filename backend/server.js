//imports
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

//middewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes connenction
app.use("/api/auth", authRoutes);

//run server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});