const connection = require("../config/db");

const VALID_CATEGORIES = ['school', 'healthcare', 'bank', 'shelter'];

// GET single facility by ID
exports.getFacilityById = async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await connection.query(
            "SELECT f.*, d.district_name FROM facilities f LEFT JOIN districts d ON f.district_id = d.district_id WHERE f.facility_id = ?",
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Facility not found" });
        }

        res.json({ success: true, data: results[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET all facilities (optionally filter by name search, category, or district)
exports.getAllFacilities = async (req, res) => {
    const { name, category, districtId } = req.query;

    try {
        let sql = `
            SELECT f.*, d.district_name
            FROM facilities f
            LEFT JOIN districts d ON f.district_id = d.district_id
            WHERE 1=1
        `;
        const params = [];

        if (name) {
            sql += " AND f.name LIKE ?";
            params.push(`%${name}%`);
        }

        if (category) {
            sql += " AND f.category = ?";
            params.push(category);
        }

        if (districtId) {
            sql += " AND f.district_id = ?";
            params.push(districtId);
        }

        sql += " ORDER BY f.name ASC";

        const [results] = await connection.query(sql, params);

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET all facilities for a district by district name
exports.getFacilitiesByDistrictName = async (req, res) => {
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

// CREATE facility (admin only)
exports.createFacility = async (req, res) => {
    const {
        district_id,
        category,
        name,
        type,
        ownership,
        ward,
        address,
        phone,
        details,
        latitude,
        longitude
    } = req.body;

    if (!district_id || !category || !name) {
        return res.status(400).json({
            success: false,
            message: "district_id, category and name are required"
        });
    }

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`
        });
    }

    if (latitude !== undefined && latitude !== null && (latitude < -90 || latitude > 90)) {
        return res.status(400).json({
            success: false,
            message: "Latitude must be between -90 and 90"
        });
    }

    if (longitude !== undefined && longitude !== null && (longitude < -180 || longitude > 180)) {
        return res.status(400).json({
            success: false,
            message: "Longitude must be between -180 and 180"
        });
    }

    try {
        const [result] = await connection.query(
            `INSERT INTO facilities
                (district_id, category, name, type, ownership, ward, address, phone, details, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                district_id,
                category,
                name,
                type ?? null,
                ownership ?? null,
                ward ?? null,
                address ?? null,
                phone ?? null,
                details ?? null,
                latitude ?? null,
                longitude ?? null
            ]
        );

        res.status(201).json({ success: true, message: "Facility created", facilityId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE facility (admin only)
exports.updateFacility = async (req, res) => {
    const { id } = req.params;
    const {
        category,
        name,
        type,
        ownership,
        ward,
        address,
        phone,
        details,
        latitude,
        longitude
    } = req.body;

    if (!category || !name) {
        return res.status(400).json({
            success: false,
            message: "category and name are required"
        });
    }

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`
        });
    }

    if (latitude !== undefined && latitude !== null && (latitude < -90 || latitude > 90)) {
        return res.status(400).json({
            success: false,
            message: "Latitude must be between -90 and 90"
        });
    }

    if (longitude !== undefined && longitude !== null && (longitude < -180 || longitude > 180)) {
        return res.status(400).json({
            success: false,
            message: "Longitude must be between -180 and 180"
        });
    }

    try {
        const [result] = await connection.query(
            `UPDATE facilities
             SET category = ?, name = ?, type = ?, ownership = ?, ward = ?, address = ?, phone = ?, details = ?, latitude = ?, longitude = ?
             WHERE facility_id = ?`,
            [
                category,
                name,
                type ?? null,
                ownership ?? null,
                ward ?? null,
                address ?? null,
                phone ?? null,
                details ?? null,
                latitude ?? null,
                longitude ?? null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Facility not found" });
        }

        res.json({ success: true, message: "Facility updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE facility (admin only)
exports.deleteFacility = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await connection.query("DELETE FROM facilities WHERE facility_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Facility not found" });
        }

        res.json({ success: true, message: "Facility deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};