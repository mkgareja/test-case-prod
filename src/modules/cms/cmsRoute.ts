// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { CMSController } from './cmsController';

import {
} from './cmsModel';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const cmsController = new CMSController();

router.get('/static-page', cmsController.staticPage);
// Export the express.Router() instance to be used by server.ts
export const CMSRoute: Router = router;
