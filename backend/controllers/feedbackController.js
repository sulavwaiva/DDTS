const connection = require("../config/db");

// GET all feedback (admin/officer only)
exports.getAllFeedback = async (req, res) => {
    try {
        const [results] = await connection.query(
            "SELECT f.*, u.name AS submitted_by_name FROM feedback f LEFT JOIN users u ON f.user_id = u.user_id ORDER BY f.creation_date DESC"
        );
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single feedback by ID
exports.getFeedbackById = async (req, res) => {
    const { id } = req.params;

    try {
        const [feedback] = await connection.query(
            "SELECT f.*, u.name AS submitted_by_name FROM feedback f LEFT JOIN users u ON f.user_id = u.user_id WHERE f.feedback_id = ?",
            [id]
        );

        if (feedback.length === 0) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        // ── IDOR fix ──────────────────────────────────────────
        // Citizens can only view their own feedback
        // Admins can view any feedback
        if (req.user.role !== "admin" && feedback[0].user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
        // ─────────────────────────────────────────────────────

        const [history] = await connection.query(
            "SELECT fh.*, u.name AS changed_by_name FROM feedback_history fh LEFT JOIN users u ON fh.user_id = u.user_id WHERE fh.feedback_id = ? ORDER BY fh.date ASC",
            [id]
        );

        res.json({ success: true, data: { ...feedback[0], history } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET my feedback (citizen - own submissions only)
exports.getMyFeedback = async (req, res) => {
    try {
        const [results] = await connection.query(
            "SELECT * FROM feedback WHERE user_id = ? ORDER BY creation_date DESC",
            [req.user.userId]
        );
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.submitFeedback = async (req, res) => {
    const { details } = req.body;

    if (!details) {
        return res.status(400).json({ success: false, message: "Feedback details are required" });
    }

    if (!req.user.district_id) {
        return res.status(400).json({
            success: false,
            message: "You must be registered to a district to submit feedback"
        });
    }

    try {
        const [result] = await connection.query(
            "INSERT INTO feedback (user_id, district_id, details, status) VALUES (?, ?, ?, 'pending')",
            [req.user.userId, req.user.district_id, details]
        );

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedbackId: result.insertId
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// update as a transaction
exports.updateFeedbackStatus = async (req, res) => {
    const { id } = req.params;
    const { status, change_note } = req.body;

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Get a dedicated connection from the pool for this transaction
    const conn = await connection.getConnection();

    try {
        const [current] = await conn.query(
            "SELECT status FROM feedback WHERE feedback_id = ?",
            [id]
        );

        if (current.length === 0) {
            conn.release();
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        const old_status = current[0].status;

        await conn.beginTransaction();

        await conn.query(
            "UPDATE feedback SET status = ? WHERE feedback_id = ?",
            [status, id]
        );

        await conn.query(
            "INSERT INTO feedback_history (feedback_id, user_id, old_status, new_status, change_note) VALUES (?, ?, ?, ?, ?)",
            [id, req.user.userId, old_status, status, change_note || null]
        );

        await conn.commit();

        res.json({ success: true, message: "Feedback status updated" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
};