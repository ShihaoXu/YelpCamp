const catchAsync = require('../utils/catchAsync');
const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviewController = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.create));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.destroy))

module.exports = router;