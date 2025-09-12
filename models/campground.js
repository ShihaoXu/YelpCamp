const mongoose = require('mongoose');
const Schema = mongoose.Schema; // short name
const Review = require('./review');

// https://res.cloudinary.com/<cloud name>/image/<type>/<identifier>.<format file extension>
// https://res.cloudinary.com/djiuhsdmb/image/upload/v1757627577/YelpCamp/xcd2hxz73y1qodkjrn2w.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Using virtual so that we dont need to store it in our model
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})
const CampgroundSchema = new Schema({
    title: String,
    images: [ ImageSchema ],
    price: Number,
    image: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);