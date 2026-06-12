//load sql and .env
const mysql = require("mysql2");
require("dotenv").config();

//create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//check connenction
db.connect((err) => {
  if (err) {
    console.error("Database connection failed");
    console.error(err);
    return;
  }

  console.log("MySQL Connected");
});

//exports
module.exports = db;