import { Router } from 'express';
import { Validator } from '../../validate';
import { Middleware } from '../../middleware';
import { AuthMiddleware } from '../auth/authMiddleware';
import { AuthController } from '../auth/authController';
import { AutomationController } from './automationController';
import { AutomationMiddleware } from './automationMiddleware';

// Assign router to the express.Router() instance
const middleware = new Middleware();
const router: Router = Router();
const v: Validator = new Validator();
const authMiddleware = new AuthMiddleware();
const automationMiddleware = new AutomationMiddleware();
const authController = new AuthController();
const automationController = new AutomationController();


router.post('/login', authMiddleware.checkCredentials, automationMiddleware.isOrganisationEligible, authController.login);
router.get('/projects', middleware.getUserAuthorized, automationMiddleware.isOrganisationEligible, automationController.getProjects);
router.get('/projects/:id', middleware.getUserAuthorized, automationMiddleware.isOrganisationEligible, automationController.getProject);
router.get('/projects/task/:pid', middleware.getUserAuthorized, automationMiddleware.isOrganisationEligible, automationController.getTasksSubtasks);


// Export the express.Router() instance to be used by server.ts
export const AutomationRoute: Router = router;