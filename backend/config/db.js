require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Dts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick check that the pool can actually reach the database
pool.getConnection((err, conn) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL');
  conn.release();
});

module.exports = pool.promise(); // enables async/await for queries elsewhere
