const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    category: Joi.string().valid(
        'Homestays & Guesthouses', 
        'Hotels & Motels', 
        'Heritage & Unique Stays'
    ).required(),
    tags: Joi.array().items(Joi.string().trim()).default(["wifi", "pool", "budget"]),
  }).required(),
  images: Joi.any() 
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

module.exports.activitySchema = Joi.object({
  activity: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    duration: Joi.string().optional(),
    difficulty: Joi.string().valid('Easy', 'Moderate', 'Hard', 'High-Risk').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
  }).required(),
  images: Joi.any() 
});