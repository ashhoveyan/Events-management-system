import { Router } from 'express';

import usersRoutes from './usersRouters.js';
import eventsRoutes from './eventsRouters.js';

const router = Router();

router.use('/users', usersRoutes);
router.use('/events', eventsRoutes);

export default router;