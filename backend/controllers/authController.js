const connection = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// define signup.always citizen at first
exports.signup = async (req, res) => {
    const { name, phone, password, district_id } = req.body;


    //validation
    if (!name || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, phone and password are required"
        });
    }

     if (!/^(97|98)[0-9]{8}$/.test(phone)) {
    return res.status(400).json({
        success: false,
        message: "Please enter a valid Nepal mobile number starting with 97 or 98"
    });

    }

     if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    //database opeartion
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
};//error message

// define login.two users citizen and admin
exports.login = async (req, res) => {
    const { phone, password } = req.body;


    //validation (data received from the frontend)
    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone and password are required"
        });
    }
 
    //database operation
    try {
        const [results] = await connection.query(
            "SELECT u.*, d.district_name, d.province FROM users u LEFT JOIN districts d ON u.district_id = d.district_id WHERE u.phone = ?",
            [phone]
        );

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "invalid credentials"
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


        //create signed jwt
        const token = jwt.sign(
            { userId: user.user_id, role: user.role, name: user.name, district_id:user.district_id},
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


// change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;


    //validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current and new password are required"
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 8 characters"
        });
    }

    //database operations
    try {
        const [results] = await connection.query(
            "SELECT password FROM users WHERE user_id = ?",
            [req.user.userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, results[0].password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await connection.query(
            "UPDATE users SET password = ? WHERE user_id = ?",
            [hashedPassword, req.user.userId]
        );

        res.json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};//error message