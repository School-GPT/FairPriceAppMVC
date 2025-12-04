const db = require('../db');

class UserModel {

    static create(username, email, password, address, contact, role, callback) {
        const sql = `
            INSERT INTO users (username, email, password, address, contact, role)
            VALUES (?, ?, SHA1(?), ?, ?, ?)
        `;
        db.query(sql, [username, email, password, address, contact, role], callback);
    }

    static findByCredentials(email, password, callback) {
        const sql = `
            SELECT * FROM users
            WHERE email = ? AND password = SHA1(?)
        `;
        db.query(sql, [email, password], callback);
    }

    static findById(id, callback) {
        db.query("SELECT * FROM users WHERE id = ?", [id], callback);
    }
}

module.exports = UserModel;
