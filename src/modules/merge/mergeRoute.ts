// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { MergeController } from './mergeController';
import { Middleware } from '../../middleware';

import {
    ProjectModel
} from './mergeModel';

// Assign router to the express.Router() instance
const middleware = new Middleware();
const router: Router = Router();
const v: Validator = new Validator();
const mergeController = new MergeController();

router.get('/:id',middleware.getUserAuthorized, mergeController.getMerge)
router.get('/mid/:id',middleware.getUserAuthorized, mergeController.getMergeById)
router.post('/',middleware.getUserAuthorized, mergeController.addMerge)
router.post('/update/:id',middleware.getUserAuthorized, mergeController.updateProject)



// Export the express.Router() instance to be used by server.ts
export const MergeRoute: Router = router;
