const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


const campgroundsValidateSchema = Joi.object({
    title : Joi.string()
        .required()
        .escapeHTML(),
    price : Joi.number()
        .required()
        .min(0),
    location : Joi.string()
        .required()
        .escapeHTML(),
    description : Joi.string()
        .allow(null, '')
        .escapeHTML(),
    deleteImages : Joi.array()    
})

const reviewsValidateSchema =Joi.object({
    text : Joi.string().allow(null,'').escapeHTML(),
    rating : Joi.number().min(1).max(5)
})

module.exports = {campgroundsValidateSchema ,reviewsValidateSchema};