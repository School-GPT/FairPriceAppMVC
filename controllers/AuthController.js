const UserModel = require('../models/UserModel');

exports.registerPage = (req, res) => {
    res.render('auth/register', {
        messages: req.flash('error'),
        formData: req.flash('formData')[0]
    });
};

exports.register = (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    UserModel.create(username, email, password, address, contact, role, (err) => {
        if (err) throw err;
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};

exports.loginPage = (req, res) => {
    res.render('auth/login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    UserModel.findByCredentials(email, password, (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.user = results[0];
            if (results[0].role === 'admin') res.redirect('/inventory');
            else res.redirect('/shopping');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};
