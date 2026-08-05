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

        // Also get history for this feedback
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

// SUBMIT feedback (any logged in user)
exports.submitFeedback = async (req, res) => {
    const { details } = req.body;

    if (!details) {
        return res.status(400).json({ success: false, message: "Feedback details are required" });
    }

    try {
        const [result] = await connection.query(
            "INSERT INTO feedback (user_id, details, status) VALUES (?, ?, 'pending')",
            [req.user.userId, details]
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

// UPDATE feedback status (admin/officer only)
exports.updateFeedbackStatus = async (req, res) => {
    const { id } = req.params;
    const { status, change_note } = req.body;

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    try {
        // Get current status first
        const [current] = await connection.query(
            "SELECT status FROM feedback WHERE feedback_id = ?",
            [id]
        );

        if (current.length === 0) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }

        const old_status = current[0].status;

        // Update feedback status
        await connection.query(
            "UPDATE feedback SET status = ? WHERE feedback_id = ?",
            [status, id]
        );

        // Log to feedback_history
        await connection.query(
            "INSERT INTO feedback_history (feedback_id, user_id, old_status, new_status, change_note) VALUES (?, ?, ?, ?, ?)",
            [id, req.user.userId, old_status, status, change_note || null]
        );

        res.json({ success: true, message: "Feedback status updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};