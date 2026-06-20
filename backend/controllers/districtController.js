const connection = require("../config/db");

// Get district by name
exports.getDistrictByName = (req, res) => {

    const districtName = req.params.name;

    const sql = `
        SELECT
            d.district_name,
            d.province,
            di.total_population,
            di.no_of_female,
            di.no_of_male
        FROM districts d
        JOIN district_info di
            ON d.district_id = di.district_id
        WHERE LOWER(d.district_name) = LOWER(?)
    `;

    connection.query(sql, [districtName], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};