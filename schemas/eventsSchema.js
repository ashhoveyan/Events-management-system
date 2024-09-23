import Joi from 'joi';

export default {
    createEvent: Joi.object({
        title: Joi.string().min(1).max(30).required(),
        description: Joi.string().min(1).max(100).required(),
        date: Joi.date().iso().required(),
        location: Joi.string().min(1).max(100).required(),
    }),
    getEvents: Joi.object({
        page: Joi.number().integer().min(1).max(10000000).default(1).optional(),
        limit: Joi.number().integer().min(5).max(20).default(5).optional(),
    }),
    subscribeEvent: Joi.object({
        username: Joi.string().min(1).max(25).required(),
        email: Joi.string().email().required(),
    })

};