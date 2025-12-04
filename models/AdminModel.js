// models/AdminModel.js
const db = require('../db');

module.exports = {

    // Dashboard metrics (all numeric fields cast properly)
    getDashboardMetrics(callback) {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM users) AS totalUsers,
                (SELECT COUNT(*) FROM products) AS totalProducts,
                (SELECT COUNT(*) FROM orders) AS totalOrders,
                CAST((SELECT IFNULL(SUM(total_amount),0) FROM orders) AS DECIMAL(10,2)) AS totalSales,
                (SELECT COUNT(*) FROM products WHERE quantity <= 5) AS lowStockCount
            FROM dual
        `;
        db.query(sql, callback);
    },

    // Low stock items
    getLowStockItems(callback) {
        const sql = `
            SELECT 
                id,
                productName,
                quantity
            FROM products
            WHERE quantity <= 5
            ORDER BY quantity ASC
        `;
        db.query(sql, callback);
    },

    // Recent orders (cast numeric fields)
    getRecentOrders(callback) {
        const sql = `
            SELECT 
                o.id AS orderId,
                CAST(o.total_amount AS DECIMAL(10,2)) AS totalAmount,
                o.status,
                o.created_at,
                u.username
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `;
        db.query(sql, callback);
    },

    getOrderDetails(orderId, callback) {
        const sql = `
            SELECT 
                oi.product_id,
                p.productName,
                oi.quantity,
                CAST(oi.unit_price AS DECIMAL(10,2)) AS unit_price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        db.query(sql, [orderId], callback);
    }
};
