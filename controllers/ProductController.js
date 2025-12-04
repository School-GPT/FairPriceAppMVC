const ProductModel = require('../models/ProductModel');

// Auto-detect category based on keywords
function detectCategory(name) {
    const n = name.toLowerCase();

    if (n.includes("apple") || n.includes("banana") || n.includes("orange") || n.includes("tomato"))
        return "Fruits";

    if (n.includes("broccoli") || n.includes("carrot") || n.includes("spinach") || n.includes("cabbage"))
        return "Vegetables";

    if (n.includes("milk") || n.includes("cheese") || n.includes("yogurt") || n.includes("butter"))
        return "Dairy";

    if (n.includes("bread") || n.includes("bun") || n.includes("cake") || n.includes("donut"))
        return "Bakery";

    return "Others";
}

//======================================================
// INVENTORY PAGE (ADMIN) — ADDS LOW-STOCK DETECTION

exports.inventory = (req, res) => {
    ProductModel.getAll((err, products) => {
        if (err) throw err;

        // Detect low stock & out of stock
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5);
        const outOfStock = products.filter(p => p.quantity === 0);

        res.render('products/inventory', {
            products,
            lowStock,
            outOfStock,
            user: req.session.user
        });
    });
};

//======================================================
// SHOPPING PAGE — DYNAMIC CATEGORIES

exports.shopping = (req, res) => {
    ProductModel.getAll((err, products) => {
        if (err) throw err;

        const categorizedProducts = products.map(p => ({
            ...p,
            category: p.category || detectCategory(p.productName)
        }));

        const categories = [...new Set(categorizedProducts.map(p => p.category))];

        res.render('products/shopping', {
            products: categorizedProducts,
            categories,
            user: req.session.user
        });
    });
};

exports.productDetails = (req, res) => {
    ProductModel.getById(req.params.id, (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.status(404).send("Product not found");

        res.render('products/product', {
            product: results[0],
            user: req.session.user
        });
    });
};

exports.addProductPage = (req, res) => {
    res.render('products/addProduct', { user: req.session.user });
};

exports.addProduct = (req, res) => {
    let category =
        req.body.category === "New"
            ? req.body.newCategory.trim()
            : req.body.category;

    if (!category || category.length === 0) {
        category = detectCategory(req.body.name);
    }

    const data = {
        productName: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price,
        image: req.file ? req.file.filename : null,
        category: category
    };

    ProductModel.create(data, err => {
        if (err) throw err;
        res.redirect('/inventory');
    });
};

exports.updateProductPage = (req, res) => {
    ProductModel.getById(req.params.id, (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.status(404).send("Not found");

        res.render('products/updateProduct', {
            product: results[0],
            user: req.session.user
        });
    });
};

exports.updateProduct = (req, res) => {
    let category =
        req.body.category === "New"
            ? req.body.newCategory.trim()
            : req.body.category;

    if (!category || category.length === 0) {
        category = detectCategory(req.body.name);
    }

    const updatedData = {
        productName: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price,
        image: req.file ? req.file.filename : req.body.currentImage,
        category: category
    };

    ProductModel.update(req.params.id, updatedData, err => {
        if (err) throw err;
        res.redirect('/inventory');
    });
};

exports.deleteProduct = (req, res) => {
    ProductModel.delete(req.params.id, err => {
        if (err) throw err;
        res.redirect('/inventory');
    });
};
