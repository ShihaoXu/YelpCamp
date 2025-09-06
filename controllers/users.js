const User = require('../models/user');

function renderRegister(req, res) {
    res.render('users/register');
}

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

function renderLogin(req, res) {
    res.render('users/login');
}

function login(req, res) {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

function logout(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    })
}

module.exports = {
    renderRegister,
    register,
    renderLogin,
    login,
    logout
};