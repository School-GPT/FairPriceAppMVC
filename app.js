// app.js (Final Version – with DB Cart + Checkout)

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const app = express();
require('dotenv').config();

// DB connection
const db = require('./db');

// Controllers
const ProductController = require('./controllers/ProductController');
const AuthController = require('./controllers/AuthController');
const CartController = require('./controllers/CartController');
const OrderController = require('./controllers/OrderController');

// Middlewares
const { checkAuthenticated } = require('./middlewares/authMiddleware');
const { checkAdmin } = require('./middlewares/adminMiddleware');
const { validateRegistration } = require('./middlewares/validateMiddleware');

// ========== MULTER SETUP FOR IMAGE UPLOAD ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// ========== EXPRESS CONFIG ==========
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// ========== SESSION + FLASH CONFIG ==========
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } 
}));
app.use(flash());

// ========== GLOBAL TEMPLATE VARIABLES ==========
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errors = req.flash("error") || [];
    res.locals.messages = req.flash("success") || [];
    next();
});

// ====================== HOME ======================
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// ====================== AUTH ROUTES ======================
app.get('/register', AuthController.registerPage);
app.post('/register', validateRegistration, AuthController.register);

app.get('/login', AuthController.loginPage);
app.post('/login', AuthController.login);

app.get('/logout', AuthController.logout);

// ====================== PRODUCT ROUTES ======================
app.get('/inventory', checkAuthenticated, checkAdmin, ProductController.inventory);

app.get('/shopping', checkAuthenticated, ProductController.shopping);

app.get('/product/:id', checkAuthenticated, ProductController.productDetails);

app.get('/addProduct', checkAuthenticated, checkAdmin, ProductController.addProductPage);
app.post('/addProduct', upload.single('image'), checkAuthenticated, checkAdmin, ProductController.addProduct);

app.get('/updateProduct/:id', checkAuthenticated, checkAdmin, ProductController.updateProductPage);
app.post('/updateProduct/:id', upload.single('image'), checkAuthenticated, checkAdmin, ProductController.updateProduct);

app.get('/deleteProduct/:id', checkAuthenticated, checkAdmin, ProductController.deleteProduct);


// ====================== ADMIN ORDER MANAGEMENT ======================
app.get('/admin/orders', checkAuthenticated, checkAdmin, OrderController.adminOrdersPage);
app.get('/admin/orders/:id', checkAuthenticated, checkAdmin, OrderController.adminOrderDetails);

// ====================== CART ROUTES (DATABASE) ======================

// Add item to cart
app.post('/cart/add/:productId', checkAuthenticated, CartController.addToCart);

// View cart
app.get('/cart', checkAuthenticated, CartController.cartPage);

// Update quantity
app.post('/cart/update', checkAuthenticated, CartController.updateCart);

// Remove item
app.get('/cart/remove/:productId', checkAuthenticated, CartController.removeItem);

// ====================== ORDER / CHECKOUT ROUTES ======================
app.get('/checkout', checkAuthenticated, OrderController.checkoutPage);
app.post('/checkout', checkAuthenticated, OrderController.processCheckout);

// ====================== START SERVER ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
