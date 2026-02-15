const db = require('../config/database');

// Create new sale
exports.createSale = async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { customer_name, customer_phone, items, payment_method, discount_amount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Sale must contain at least one item'
            });
        }

        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            const [medicines] = await connection.query(
                'SELECT unit_price, stock_quantity FROM medicines WHERE id = ?',
                [item.medicine_id]
            );

            if (medicines.length === 0) {
                throw new Error(`Medicine with ID ${item.medicine_id} not found`);
            }

            if (medicines[0].stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for medicine ID ${item.medicine_id}`);
            }

            subtotal += medicines[0].unit_price * item.quantity;
        }

        const tax_amount = subtotal * 0.18; // 18% GST
        const total_amount = subtotal + tax_amount - (discount_amount || 0);

        // Generate invoice number
        const invoice_number = `INV-${Date.now()}`;

        // Insert sale
        const [saleResult] = await connection.query(
            `INSERT INTO sales (invoice_number, customer_name, customer_phone, subtotal, 
       tax_amount, discount_amount, total_amount, payment_method, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [invoice_number, customer_name, customer_phone, subtotal, tax_amount,
                discount_amount || 0, total_amount, payment_method, req.user.id]
        );

        const saleId = saleResult.insertId;

        // Insert sale items and update inventory
        for (const item of items) {
            const [medicines] = await connection.query(
                'SELECT unit_price FROM medicines WHERE id = ?',
                [item.medicine_id]
            );

            const itemSubtotal = medicines[0].unit_price * item.quantity;

            await connection.query(
                'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [saleId, item.medicine_id, item.quantity, medicines[0].unit_price, itemSubtotal]
            );

            // Update stock
            await connection.query(
                'UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.medicine_id]
            );

            // Log inventory change
            await connection.query(
                'INSERT INTO inventory_logs (medicine_id, action_type, quantity_change, quantity_after, user_id) VALUES (?, ?, ?, (SELECT stock_quantity FROM medicines WHERE id = ?), ?)',
                [item.medicine_id, 'sale', -item.quantity, item.medicine_id, req.user.id]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: { id: saleId, invoice_number, total_amount }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// Get all sales
exports.getAllSales = async (req, res, next) => {
    try {
        const { startDate, endDate, payment_method } = req.query;

        let query = 'SELECT * FROM sales WHERE 1=1';
        const params = [];

        if (startDate) {
            query += ' AND DATE(created_at) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(created_at) <= ?';
            params.push(endDate);
        }

        if (payment_method) {
            query += ' AND payment_method = ?';
            params.push(payment_method);
        }

        query += ' ORDER BY created_at DESC';

        const [sales] = await db.query(query, params);

        res.json({
            success: true,
            count: sales.length,
            data: sales
        });
    } catch (error) {
        next(error);
    }
};

// Get sale by ID with items
exports.getSaleById = async (req, res, next) => {
    try {
        const [sales] = await db.query(
            'SELECT * FROM sales WHERE id = ?',
            [req.params.id]
        );

        if (sales.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        const [items] = await db.query(
            `SELECT si.*, m.name as medicine_name 
       FROM sale_items si 
       JOIN medicines m ON si.medicine_id = m.id 
       WHERE si.sale_id = ?`,
            [req.params.id]
        );

        res.json({
            success: true,
            data: { ...sales[0], items }
        });
    } catch (error) {
        next(error);
    }
};
