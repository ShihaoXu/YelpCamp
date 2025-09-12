const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

async function index(req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

function renderNewForm(req, res) {
    res.render("campgrounds/new");
}

async function create(req, res) {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; // GeoJSON format
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id; // req.user is added by passport
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

async function show(req, res) {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        // populate reviews and their authors
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author'); // it's the `author` field in campgroundSchema
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds'); // TODO: why return?
    }
    res.render('campgrounds/show', { campground });
}

async function renderEditForm(req, res) {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

async function update(req, res) {
    const { id } = req.params;
    // console.log("checkbox:");
    // console.log(req.body);
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    campground.images.push(...req.files.map(f => ({url: f.path, filename: f.filename})));
    await Campground.findByIdAndUpdate(id, campground);

    if (req.body.deleteImages) {
        for (const filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground);
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}

async function destroy(req, res) {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}

module.exports = {
    index,
    renderNewForm,
    create,
    show,
    renderEditForm,
    update,
    destroy
};