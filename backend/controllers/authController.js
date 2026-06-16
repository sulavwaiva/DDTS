const db = require("../config/db");
const bcrypt = require("bcrypt");

// SIGNUP
exports.signup = async (req, res) => {
  const { name, phone, district, password } = req.body;

  // Name validation
  if (!name || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  // Phone validation (exactly 10 digits)
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({
      message: "Phone number must be exactly 10 digits"
    });
  }

  //district validation
  if (!district) {
  return res.status(400).json({
    message: "District is required"
  });
}

  // Password validation
  if (!password || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }


  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, phone, district, password) VALUES (?, ?, ?, ?)",
      [name.trim(), phone, district, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);

          return res.status(400).json({
            message: "Phone number already exists"
          });
        }

        res.json({
          message: "Signup successful"
        });
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      message: "Phone and password are required"
    });
  }

  db.query(
    "SELECT * FROM users WHERE phone = ?",
    [phone],
    async (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Server error"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = results[0];

      const match = await bcrypt.compare(
        password,
        user.password
      );

      if (!match) {
        return res.status(401).json({
          message: "Wrong password"
        });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
           district: user.district
        }
      });
    }
  );
};