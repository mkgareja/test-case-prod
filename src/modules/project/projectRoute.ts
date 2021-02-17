// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { ProjectController } from './projectController';
import { Middleware } from '../../middleware';

import {
    ProjectModel
} from './projectModel';

// Assign router to the express.Router() instance
const middleware = new Middleware();
const router: Router = Router();
const v: Validator = new Validator();
const projectController = new ProjectController();

router.get('/',middleware.getUserAuthorized, projectController.getProject);
router.post('/',middleware.getUserAuthorized, v.validate(ProjectModel), projectController.addProject);
router.post('/invite',middleware.getUserAuthorized, projectController.inviteInProject);
router.post('/task/:id',middleware.getUserAuthorized, projectController.updateTask);
router.post('/field/:id',middleware.getUserAuthorized, projectController.updateField);
router.get('/task/:id',middleware.getUserAuthorized, projectController.getTask);
router.post('/:id',middleware.getUserAuthorized, v.validate(ProjectModel), projectController.updateProject);
router.delete('/:id',middleware.getUserAuthorized, projectController.deleteProject);
//test run
router.post('/run/:id',middleware.getUserAuthorized, projectController.addTestRun);
router.post('/update/run/:id',middleware.getUserAuthorized, projectController.updateTestRun);
router.get('/run/:id',middleware.getUserAuthorized, projectController.getTestRun);
router.get('/result/:id',middleware.getUserAuthorized, projectController.getTestRuns);


// Export the express.Router() instance to be used by server.ts
export const ProjectRoute: Router = router;
