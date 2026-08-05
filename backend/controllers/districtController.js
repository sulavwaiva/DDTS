const connection = require("../config/db");

// GET all districts (for map + dropdown)
exports.getAllDistricts = async (req, res) => {
    try {
        const [results] = await connection.query(
            "SELECT d.district_id, d.district_name, d.province, di.total_population, di.no_of_male, di.no_of_female, CASE WHEN di.literacy_rate IS NOT NULL THEN 1 ELSE 0 END AS has_full_data FROM districts d LEFT JOIN district_info di ON d.district_id = di.district_id ORDER BY d.district_name"
        );

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single district by name (map click)
exports.getDistrictByName = async (req, res) => {
    const { name } = req.params;

    try {
        const [results] = await connection.query(
            "SELECT d.*, di.* FROM districts d LEFT JOIN district_info di ON d.district_id = di.district_id WHERE LOWER(d.district_name) = LOWER(?)",
            [name]
        );

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        res.json({ success: true, data: results[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single district by ID (data page dropdown)
exports.getDistrictById = async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await connection.query(
            "SELECT d.*, di.* FROM districts d LEFT JOIN district_info di ON d.district_id = di.district_id WHERE d.district_id = ?",
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        res.json({ success: true, data: results[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET all facilities for a district by district name
exports.getFacilities = async (req, res) => {
    const { name } = req.params;

    try {
        const sql = `
            SELECT f.*
            FROM facilities f
            JOIN districts d ON f.district_id = d.district_id
            WHERE d.district_name = ?
            ORDER BY f.name ASC
        `;

        const [results] = await connection.query(sql, [name]);

        res.json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};