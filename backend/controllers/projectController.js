const connection = require("../config/db");

const VALID_STATUSES = ['planned', 'ongoing', 'completed', 'delayed'];

// GET all projects (optionally filter by district)
exports.getAllProjects = async (req, res) => {
    const { districtId } = req.query;

    try {
        let sql = "SELECT p.*, d.district_name FROM projects p LEFT JOIN districts d ON p.district_id = d.district_id";
        const params = [];

        if (districtId) {
            sql += " WHERE p.district_id = ?";
            params.push(districtId);
        }

        sql += " ORDER BY p.created_at DESC";

        const [results] = await connection.query(sql, params);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single project by ID
exports.getProjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await connection.query(
            "SELECT p.*, d.district_name FROM projects p LEFT JOIN districts d ON p.district_id = d.district_id WHERE p.project_id = ?",
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.json({ success: true, data: results[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// CREATE project (admin only)
exports.createProject = async (req, res) => {
    const {
        district_id,
        name,
        details,
        budget,
        funding_source,
        fiscal_year,
        start_date,
        completion_date,
        status,
        remarks
    } = req.body;

    if (!district_id || !name) {
        return res.status(400).json({ success: false, message: "District and project name are required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
        });
    }

    try {
        const [result] = await connection.query(
            `INSERT INTO projects
                (district_id, name, details, budget, funding_source, fiscal_year, start_date, completion_date, status, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                district_id,
                name,
                details ?? null,
                budget ?? null,
                funding_source ?? null,
                fiscal_year ?? null,
                start_date ?? null,
                completion_date ?? null,
                status || 'planned',
                remarks ?? null
            ]
        );

        res.status(201).json({ success: true, message: "Project created", projectId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE project (admin only)
exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        details,
        budget,
        funding_source,
        fiscal_year,
        start_date,
        completion_date,
        status,
        remarks
    } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Project name is required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
        });
    }

    try {
        const [result] = await connection.query(
            `UPDATE projects
             SET name = ?, details = ?, budget = ?, funding_source = ?, fiscal_year = ?,
                 start_date = ?, completion_date = ?, status = ?, remarks = ?
             WHERE project_id = ?`,
            [
                name,
                details ?? null,
                budget ?? null,
                funding_source ?? null,
                fiscal_year ?? null,
                start_date ?? null,
                completion_date ?? null,
                status || 'planned',
                remarks ?? null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.json({ success: true, message: "Project updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE project (admin only)
exports.deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await connection.query("DELETE FROM projects WHERE project_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.json({ success: true, message: "Project deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};