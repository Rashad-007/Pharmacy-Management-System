const db = require('../config/database');

// Get all medicines
exports.getAllMedicines = async (req, res, next) => {
    try {
        const { category, search, lowStock } = req.query;

        let query = 'SELECT * FROM medicines WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (name LIKE ? OR generic_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (lowStock === 'true') {
            query += ' AND stock_quantity <= reorder_level';
        }

        query += ' ORDER BY name ASC';

        const [medicines] = await db.query(query, params);

        res.json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        next(error);
    }
};

// Get medicine by ID
exports.getMedicineById = async (req, res, next) => {
    try {
        const [medicines] = await db.query(
            'SELECT * FROM medicines WHERE id = ?',
            [req.params.id]
        );

        if (medicines.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.json({
            success: true,
            data: medicines[0]
        });
    } catch (error) {
        next(error);
    }
};

// Add new medicine
exports.addMedicine = async (req, res, next) => {
    try {
        const {
            name, generic_name, category, manufacturer, description,
            unit_price, stock_quantity, reorder_level, expiry_date,
            batch_number, barcode, storage_location, requires_prescription
        } = req.body;

        if (!name || !unit_price) {
            return res.status(400).json({
                success: false,
                message: 'Name and unit price are required'
            });
        }

        // Check for duplicates (same name and batch number)
        if (batch_number) {
            const [existing] = await db.query(
                'SELECT id FROM medicines WHERE name = ? AND batch_number = ?',
                [name, batch_number]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Medicine with this name and batch number already exists'
                });
            }
        } else {
            // If no batch number, check just by name
            const [existing] = await db.query(
                'SELECT id FROM medicines WHERE name = ? AND batch_number IS NULL',
                [name]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Medicine with this name already exists'
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO medicines (name, generic_name, category, manufacturer, description,
       unit_price, stock_quantity, reorder_level, expiry_date, batch_number, barcode,
       storage_location, requires_prescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, generic_name, category, manufacturer, description, unit_price,
                stock_quantity || 0, reorder_level || 10, expiry_date, batch_number,
                barcode, storage_location, requires_prescription || false]
        );

        // Log inventory action
        await db.query(
            'INSERT INTO inventory_logs (medicine_id, action_type, quantity_change, quantity_after, user_id) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, 'add', stock_quantity || 0, stock_quantity || 0, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Medicine added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        // Handle unique constraint violation from database
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'This medicine already exists in the database'
            });
        }
        next(error);
    }
};

// Update medicine
exports.updateMedicine = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const fields = Object.keys(updates).filter(key => key !== 'id');
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(id);

        const [result] = await db.query(
            `UPDATE medicines SET ${setClause} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.json({
            success: true,
            message: 'Medicine updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Delete medicine
exports.deleteMedicine = async (req, res, next) => {
    try {
        const [result] = await db.query(
            'DELETE FROM medicines WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.json({
            success: true,
            message: 'Medicine deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock medicines
exports.getLowStock = async (req, res, next) => {
    try {
        const [medicines] = await db.query(
            'SELECT * FROM medicines WHERE stock_quantity <= reorder_level ORDER BY stock_quantity ASC'
        );

        res.json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        next(error);
    }
};

// Get expiring soon medicines
exports.getExpiringSoon = async (req, res, next) => {
    try {
        const days = req.query.days || 30;

        const [medicines] = await db.query(
            `SELECT * FROM medicines 
       WHERE expiry_date IS NOT NULL 
       AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND expiry_date >= CURDATE()
       ORDER BY expiry_date ASC`,
            [days]
        );

        res.json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        next(error);
    }
};
