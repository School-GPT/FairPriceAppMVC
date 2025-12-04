// controllers/CartController.js
const db = require('../db');
const CartModel = require('../models/CartModel');

// ADD TO CART
exports.addToCart = (req, res) => {
    if (!req.session.user) {
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }

    const userId = req.session.user.id;
    const productId = parseInt(req.params.productId);
    const quantity = parseInt(req.body.quantity) || 1;

    console.log("DEBUG – AddToCart productId =", productId);

    if (isNaN(productId)) {
        req.flash("error", "Invalid product ID");
        return res.redirect("/shopping");
    }

    db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            req.flash("error", "Product not found");
            return res.redirect("/shopping");
        }

        CartModel.addItem(userId, productId, quantity, (err2) => {
            if (err2) throw err2;

            req.flash("success", "Item added to cart!");
            res.redirect("/cart");
        });
    });
};

// CART PAGE
exports.cartPage = (req, res) => {
    if (!req.session.user) {
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }

    const userId = req.session.user.id;

    CartModel.getCart(userId, (err, cartItems) => {
        if (err) throw err;

        res.render("cart/cart", {
            cart: cartItems,
            user: req.session.user,
            errors: req.flash("error"),
            messages: req.flash("success")
        });
    });
};

// REMOVE ITEM
exports.removeItem = (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userId = req.session.user.id;
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
        req.flash("error", "Invalid product ID");
        return res.redirect("/cart");
    }

    CartModel.removeItem(userId, productId, (err) => {
        if (err) throw err;

        req.flash("success", "Item removed from cart");
        res.redirect("/cart");
    });
};

// UPDATE ITEM
exports.updateCart = (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const userId = req.session.user.id;
    const productId = parseInt(req.body.id);
    const quantity = parseInt(req.body.quantity);

    if (isNaN(productId)) {
        req.flash("error", "Invalid product ID");
        return res.redirect("/cart");
    }

    CartModel.updateItem(userId, productId, quantity, (err) => {
        if (err) throw err;

        req.flash("success", "Cart updated");
        res.redirect('/cart');
    });
};
