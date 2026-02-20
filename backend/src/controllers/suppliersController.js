const db = require('../config/database');

// Get all suppliers
exports.getAllSuppliers = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM suppliers WHERE 1=1';
        const params = [];
        if (search) {
            query += ' AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY name ASC';
        const [suppliers] = await db.query(query, params);
        res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) { next(error); }
};

// Create supplier
exports.createSupplier = async (req, res, next) => {
    try {
        const { name, contact_person, email, phone, address, city, gst_number } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required' });

        // Check duplicate
        const [existing] = await db.query('SELECT id FROM suppliers WHERE name = ?', [name]);
        if (existing.length > 0) return res.status(409).json({ success: false, message: 'Supplier with this name already exists' });

        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address, city, gst_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, contact_person, email, phone, address, city, gst_number]
        );
        res.status(201).json({ success: true, message: 'Supplier created successfully', data: { id: result.insertId } });
    } catch (error) { next(error); }
};

// Update supplier
exports.updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, contact_person, email, phone, address, city, gst_number } = req.body;
        const [result] = await db.query(
            'UPDATE suppliers SET name=?, contact_person=?, email=?, phone=?, address=?, city=?, gst_number=? WHERE id=?',
            [name, contact_person, email, phone, address, city, gst_number, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Supplier not found' });
        res.json({ success: true, message: 'Supplier updated successfully' });
    } catch (error) { next(error); }
};

// Delete supplier
exports.deleteSupplier = async (req, res, next) => {
    try {
        const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Supplier not found' });
        res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) { next(error); }
};
