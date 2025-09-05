const isLoggedIn = (req, res, next) => {
    // console.log("req.user...", req.user);
    if (!req.isAuthenticated()) {
        console.log("req.originalUrl: ", req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isLoggedIn = isLoggedIn;

module.exports.storeReturnTo = (req, res, next) => {
    res.locals.returnTo = req.session?.returnTo
    next();
}