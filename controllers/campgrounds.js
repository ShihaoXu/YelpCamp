const Campground = require('../models/campground')

async function index(req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

function renderNewForm(req, res) {
    res.render("campgrounds/new");
}

async function create(req, res) {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // req.user is added by passport
    await campground.save();
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
    console.log(campground);
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
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndUpdate(id, req.body.campground);
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