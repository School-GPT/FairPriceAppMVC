const OrderModel = require('../models/OrderModel');
const CartModel = require('../models/CartModel');
const db = require('../db');

// =================================
// SHOW CHECKOUT PAGE

exports.checkoutPage = (req, res) => {
    const user = req.session.user;

    if (!user) {
        req.flash("error", "Please login first.");
        return res.redirect("/login");
    }

    CartModel.getCart(user.id, (err, cartItems) => {
        if (err) throw err;

        res.render("orders/checkout", {
            cart: cartItems,
            user
        });
    });
};


// ======================================
// PROCESS CHECKOUT + STOCK DEDUCTION

exports.processCheckout = (req, res) => {
    const user = req.session.user;

    if (!user) {
        req.flash("error", "Please login first.");
        return res.redirect("/login");
    }

    const userId = user.id;

    CartModel.getCart(userId, (err, cartItems) => {
        if (err) throw err;

        if (cartItems.length === 0) {
            req.flash("error", "Your cart is empty.");
            return res.redirect("/shopping");
        }

        // CHECK STOCK
        const stockChecks = cartItems.map(item => {
            return new Promise((resolve, reject) => {
                db.query(
                    "SELECT quantity FROM products WHERE id = ?",
                    [item.id],
                    (err, rows) => {
                        if (err) return reject(err);
                        if (!rows.length) return reject(new Error(`Product not found`));

                        const stock = rows[0].quantity;

                        if (item.quantity > stock) {
                            return reject(
                                new Error(
                                    `Insufficient stock for ${item.productName}. Available: ${stock}`
                                )
                            );
                        }

                        resolve();
                    }
                );
            });
        });

        Promise.all(stockChecks)
            .then(() => {
                // TOTAL PRICE
                let total = cartItems.reduce((sum, item) =>
                    sum + item.price * item.quantity, 0
                );

                //  CREATE ORDER
                OrderModel.createOrder(userId, total, (err, result) => {
                    if (err) throw err;

                    const orderId = result.insertId;

                    //  INSERT ORDER ITEMS
                    const orderItems = cartItems.map(i => [
                        orderId,
                        i.id,
                        i.quantity,
                        i.price
                    ]);

                    OrderModel.addOrderItems(orderItems, (err2) => {
                        if (err2) throw err2;

                        //  DEDUCT STOCK
                        const deduct = cartItems.map(item => {
                            return new Promise((resolve, reject) => {
                                db.query(
                                    "UPDATE products SET quantity = quantity - ? WHERE id = ?",
                                    [item.quantity, item.id],
                                    (err) => {
                                        if (err) return reject(err);
                                        resolve();
                                    }
                                );
                            });
                        });

                        Promise.all(deduct)
                            .then(() => {
                                //  LOW STOCK ALERT
                                db.query(
                                    "SELECT productName, quantity FROM products WHERE quantity <= 5",
                                    (errLow, lowStock) => {
                                        if (!errLow && lowStock.length > 0) {
                                            req.flash(
                                                "error",
                                                "⚠ Low Stock: " +
                                                lowStock.map(i => `${i.productName} (${i.quantity})`).join(", ")
                                            );
                                        }

                                        //  CLEAR CART
                                        CartModel.clearCart(userId, () => {

                                            //  LOAD ORDER SUMMARY
                                            OrderModel.getOrderItems(orderId, (err4, items) => {
                                                if (err4) throw err4;

                                                res.render("orders/confirmation", {
                                                    order: {
                                                        id: orderId,
                                                        total,
                                                        items
                                                    },
                                                    user
                                                });
                                            });
                                        });
                                    }
                                );
                            })
                            .catch(err => {
                                req.flash("error", err.message);
                                return res.redirect("/cart");
                            });
                    });
                });
            })
            .catch(err => {
                req.flash("error", err.message);
                return res.redirect("/cart");
            });

    });
};


// ======================================
// ADMIN — VIEW ALL ORDERS
exports.adminOrdersPage = (req, res) => {
    OrderModel.getAllOrders((err, orders) => {
        if (err) throw err;

        res.render("admin/orders", {
            orders,
            user: req.session.user
        });
    });
};


// ======================================
// ADMIN — VIEW ORDER DETAILS

exports.adminOrderDetails = (req, res) => {
    const orderId = req.params.id;

    OrderModel.getOrderItems(orderId, (err, items) => {
        if (err) throw err;

        OrderModel.getOrderById(orderId, (err2, orderInfo) => {
            if (err2) throw err2;

            res.render("admin/orderDetails", {
                order: orderInfo[0],
                items,
                user: req.session.user
            });
        });
    });
};
