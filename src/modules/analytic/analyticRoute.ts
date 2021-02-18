// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { AnalyticController } from './analyticController';
import { Middleware } from '../../middleware';

import {
    AnalyticModel
} from './analyticModel';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const middleware = new Middleware();
const analyticController = new AnalyticController();

router.post('/login-duration', middleware.getUserAuthorized,v.validate(AnalyticModel), analyticController.addTime);
// Export the express.Router() instance to be used by server.ts
export const AnalyticRoute: Router = router;
