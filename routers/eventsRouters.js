import {Router} from 'express';

import eventsController from '../controllers/eventsController.js';
import eventsSchema from '../schemas/eventsSchema.js';

import validate from '../middlewares/validate.js';
import authenticate from '../middlewares/auth.js';

import fileUpload from "../middlewares/fileUpload.js";

const router = Router();

//apis

router.post(
    '/create',
    fileUpload.array('images', 5),
    authenticate,
    validate(eventsSchema.createEvent, 'body'),
    eventsController.createEvents
);

router.get('/list',
    authenticate,
    validate(eventsSchema.getPosts, 'query'),
    eventsController.getEvents
)

export default router;