const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const usersControllers = require('../controllers/users');

router.route('/register')
    .get(usersControllers.renderRegister)
    .post(catchAsync(usersControllers.register))

router.route('/login')
    .get(usersControllers.renderLogin)
    .post(
        storeReturnTo,
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        usersControllers.login)

router.get('/logout', usersControllers.logout);

module.exports = router;