// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { ProjectController } from './projectController';

import {
    ProjectModel
} from './projectModel';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const projectController = new ProjectController();

router.post('/', v.validate(ProjectModel), projectController.addProject);
// Export the express.Router() instance to be used by server.ts
export const ProjectRoute: Router = router;
