//imports
const express = require("express");
const cors = require("cors");
const connection = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();

//middewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes connenction
app.use("/api/auth", authRoutes);

app.get('/api/districts/:id', (req, res) => {

  const districtId = req.params.id;

  const sql = `
    SELECT
      d.district_name,
      d.province,
      di.total_population,
      di.no_of_female,
      di.no_of_male
    FROM districts d
    JOIN district_info di
      ON d.district_id = di.district_id
    WHERE d.district_id = ?
  `;

  connection.query(sql, [districtId], (err, results) => {

    if (err)
      return res.status(500).json(err);

    res.json(results[0]);
  });
});

//run server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});