const Joi = require('joi');
const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // TODO: reenable this
        // images: Joi.array().items(Joi.object({
        //     url: Joi.string(),
        //     filename: Joi.string()
        // })).required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array().optional() // not required
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});

module.exports.campgroundSchema = campgroundSchema;