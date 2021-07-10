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

router.get('/',middleware.getUserAuthorized, projectController.getProject)
router.get('/org/user/:oid',middleware.getUserAuthorized, projectController.getOrgUsersInvited)
router.post('/',middleware.getUserAuthorized, v.validate(ProjectModel), projectController.addProject);
router.post('/invite',middleware.getUserAuthorized, projectController.inviteInProject);
router.post('/email',middleware.getUserAuthorized, projectController.sendTestRunEmail);
router.get('/org/email/:id',middleware.getUserAuthorized, projectController.getOrgEmail);
router.post('/add/org/email',middleware.getUserAuthorized, projectController.addEmailOrg);
router.post('/remove/org/email',middleware.getUserAuthorized, projectController.removeEmailOrg);
router.post('/add/user',middleware.getUserAuthorized, projectController.addUserToProject);
router.post('/remove/user',middleware.getUserAuthorized, projectController.removeUserToProject);
router.post('/task/:id',middleware.getUserAuthorized, projectController.updateTask);
router.post('/field/:id',middleware.getUserAuthorized, projectController.updateField);
router.get('/task/:id',middleware.getUserAuthorized, projectController.getTask);
router.post('/:id',middleware.getUserAuthorized, v.validate(ProjectModel), projectController.updateProject);
router.delete('/:id',middleware.getUserAuthorized, projectController.deleteProject);
//test run
router.post('/run/:id',middleware.getUserAuthorized, projectController.addTestRun);
router.post('/update/run/:id',middleware.getUserAuthorized, projectController.updateTestRun);
router.get('/run/:id',middleware.getUserAuthorized, projectController.getTestRun);
router.get('/run/projectid/:id',middleware.getUserAuthorized, projectController.getTestRunByProject);
router.get('/result/:id',middleware.getUserAuthorized, projectController.getTestRuns);
router.get('/analytics/result/:id/:limit',middleware.getUserAuthorized, projectController.getTestRunsAnalytics);


// Export the express.Router() instance to be used by server.ts
export const ProjectRoute: Router = router;
