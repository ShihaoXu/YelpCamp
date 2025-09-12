const catchAsync = require('../utils/catchAsync');
const express = require('express');
const router = express.Router();
const campgroundsController = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage }); // a local folder will accomodate the uploaded files

router.route('/')
    .get(catchAsync(campgroundsController.index))
    .post(isLoggedIn,
        upload.array('image'), // this needs to go before validateCampground because it populates req.body req.files
        // TODO: remove uploaded images if validation fails
        validateCampground,
        catchAsync(campgroundsController.create)
    );

// TODO: bs-custom-file-input only works on Bootstrap 4; make something similar work for Bootstrap 5
// TODO: limit how many images and the sizes can be uploaded
router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgroundsController.show))
    // TODO: limit how many images and the sizes can be uploaded
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundsController.update))
    .delete(isLoggedIn, catchAsync(campgroundsController.destroy))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundsController.renderEditForm)); // TODO: bug

module.exports = router;
