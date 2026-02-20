const db = require('../config/database');

// Get daily sales for last 7 days
exports.getDailySales = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_sales,
                SUM(total_amount) as revenue
            FROM sales
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Fill in missing days with 0
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = rows.find(r => r.date && r.date.toISOString().split('T')[0] === dateStr);
            result.push({
                date: dateStr,
                label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
                total_sales: found ? found.total_sales : 0,
                revenue: found ? parseFloat(found.revenue) : 0
            });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// Get top 5 selling medicines
exports.getTopMedicines = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                m.name,
                SUM(si.quantity) as total_sold,
                SUM(si.subtotal) as revenue
            FROM sale_items si
            JOIN medicines m ON si.medicine_id = m.id
            GROUP BY si.medicine_id, m.name
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// Get category-wise stock distribution
exports.getCategoryStock = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COALESCE(category, 'Other') as category,
                COUNT(*) as medicine_count,
                SUM(stock_quantity) as total_stock
            FROM medicines
            GROUP BY category
            ORDER BY total_stock DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// Get recent sales (last 10)
exports.getRecentSales = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, u.username as sold_by
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 10
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// Summary stats
exports.getSummaryStats = async (req, res, next) => {
    try {
        const [[salesStats]] = await db.query(`
            SELECT 
                COUNT(*) as total_transactions,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as today_revenue
            FROM sales
        `);

        const [[inventoryStats]] = await db.query(`
            SELECT
                COUNT(*) as total_medicines,
                SUM(CASE WHEN stock_quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count,
                SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired_count,
                SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY) THEN 1 ELSE 0 END) as expiring_soon_count
            FROM medicines
        `);

        res.json({
            success: true,
            data: {
                ...salesStats,
                ...inventoryStats,
                total_revenue: parseFloat(salesStats.total_revenue),
                today_revenue: parseFloat(salesStats.today_revenue)
            }
        });
    } catch (error) {
        next(error);
    }
};
