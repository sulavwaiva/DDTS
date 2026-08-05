const connection = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGNUP - always creates citizen
exports.signup = async (req, res) => {
    const { name, phone, password, district_id } = req.body;

    if (!name || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, phone and password are required"
        });
    }

    try {
        const [existing] = await connection.query(
            "SELECT user_id FROM users WHERE phone = ?",
            [phone]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.query(
            "INSERT INTO users (name, phone, password, role, district_id) VALUES (?, ?, ?, 'citizen', ?)",
            [name, phone, hashedPassword, district_id || null]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// LOGIN - citizen and admin
exports.login = async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone and password are required"
        });
    }

    try {
        const [results] = await connection.query(
            "SELECT u.*, d.district_name, d.province FROM users u LEFT JOIN districts d ON u.district_id = d.district_id WHERE u.phone = ?",
            [phone]
        );

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id:            user.user_id,
                name:          user.name,
                phone:         user.phone,
                role:          user.role,
                district_id:   user.district_id,
                district_name: user.district_name,
                province:      user.province,
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};