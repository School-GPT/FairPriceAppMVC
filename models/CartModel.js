// models/CartModel.js
const db = require('../db');

module.exports = {

    // Get all cart items for this user
    getCart(userId, callback) {
        const sql = `
            SELECT 
                ci.product_id AS id,   
                ci.quantity,
                p.productName,
                p.price,
                p.image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `;
        db.query(sql, [userId], (err, results) => {
        if (err) return callback(err);

        const fixed = results.map(item => ({
            ...item,
            price: parseFloat(item.price),         
            quantity: parseInt(item.quantity)      
        }));

        callback(null, fixed);
    });
    },

    // Add item OR increase quantity (ON DUPLICATE KEY)
    addItem(userId, productId, quantity, callback) {
        const sql = `
            INSERT INTO cart_items (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        db.query(sql, [userId, productId, quantity], callback);
    },

    // Remove product from cart completely
    removeItem(userId, productId, callback) {
        const sql = `
            DELETE FROM cart_items
            WHERE user_id = ? AND product_id = ?
        `;
        db.query(sql, [userId, productId], callback);
    },

    // Update the quantity of an item
    updateItem(userId, productId, quantity, callback) {
        const sql = `
            UPDATE cart_items
            SET quantity = ?
            WHERE user_id = ? AND product_id = ?
        `;
        db.query(sql, [quantity, userId, productId], callback);
    },

    // Clear cart after checkout
    clearCart(userId, callback) {
        const sql = `DELETE FROM cart_items WHERE user_id = ?`;
        db.query(sql, [userId], callback);
    }
};
