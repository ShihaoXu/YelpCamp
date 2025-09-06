const catchAsync = require('../utils/catchAsync');
const express = require('express');
const router = express.Router();
const campgroundsController = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

router.route('/')
    .get(catchAsync(campgroundsController.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgroundsController.create));

router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgroundsController.show))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundsController.update))
    .delete(isLoggedIn, catchAsync(campgroundsController.destroy))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundsController.renderEditForm)); // TODO: bug

module.exports = router;