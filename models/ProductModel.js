const db = require('../db');

module.exports = {
    getAll(callback) {
        db.query("SELECT * FROM products", (err, results) => {
        if (err) return callback(err);

        // Convert DECIMAL price (string) → number
        const fixed = results.map(p => ({
            ...p,
            price: parseFloat(p.price),
            quantity: parseInt(p.quantity)
        }));

        callback(null, fixed);
    });
    },

    getById(id, callback) {
        db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(null, results);

        const p = results[0];

        p.price = parseFloat(p.price);
        p.quantity = parseInt(p.quantity);

        callback(null, [p]);
    });
    },

    // CREATE PRODUCT (with category)
    create(data, callback) {
        db.query(
            "INSERT INTO products (productName, quantity, price, image, category) VALUES (?, ?, ?, ?, ?)",
            [data.productName, data.quantity, data.price, data.image, data.category],
            callback
        );
    },

    // UPDATE PRODUCT (with category)
    update(id, data, callback) {
        db.query(
            "UPDATE products SET productName = ?, quantity = ?, price = ?, image = ?, category = ? WHERE id = ?",
            [data.productName, data.quantity, data.price, data.image, data.category, id],
            callback
        );
    },

    delete(id, callback) {
        db.query("DELETE FROM products WHERE id = ?", [id], callback);
    }
};
