// models/OrderModel.js
const db = require('../db');

class OrderModel {

    //  Create order header
    static createOrder(userId, totalAmount, callback) {
        const sql = `
            INSERT INTO orders (user_id, total_amount, status)
            VALUES (?, ?, 'Pending')
        `;
        db.query(sql, [userId, totalAmount], callback);
    }

    //  Add multiple order items (bulk insert)
    static addOrderItems(items, callback) {
        const sql = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES ?
        `;
        db.query(sql, [items], callback);
    }

    //  Get single order summary
    static getOrderById(orderId, callback) {
        const sql = `
            SELECT *
            FROM orders
            WHERE id = ?
        `;
        db.query(sql, [orderId], callback);
    }

    //  Get items in an order (with product details)
    static getOrderItems(orderId, callback) {
        const sql = `
            SELECT 
                oi.*, 
                p.productName, 
                p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        db.query(sql, [orderId], callback);
    }

    // Get all orders + username
    static getAllOrders(callback) {
        const sql = `
            SELECT o.*, u.username
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        db.query(sql, callback);
    }

    // Get items inside an order
    static getOrderItemsAdmin(orderId, callback) {
        const sql = `
            SELECT oi.*, p.productName, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        db.query(sql, [orderId], callback);
    }

}

module.exports = OrderModel;
