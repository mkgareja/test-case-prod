// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { TaskController } from './taskController';
import { Middleware } from '../../middleware';

import {
    TaskModel,
    TaskStatusModel,
    SubTaskModel
} from './taskModel';

// Assign router to the express.Router() instance
const middleware = new Middleware();
const router: Router = Router();
const v: Validator = new Validator();
const taskController = new TaskController();

router.post('/subtask',middleware.getUserAuthorized, v.validate(SubTaskModel), taskController.addSubTask);
router.post('/subtask/:id',middleware.getUserAuthorized, v.validate(SubTaskModel), taskController.updateSubTask);
router.post('/subtask/status/:id',middleware.getUserAuthorized, taskController.updateSubTaskStatus);
router.delete('/:id',middleware.getUserAuthorized, taskController.deleteTask);
router.delete('/subtask/:id',middleware.getUserAuthorized, taskController.deleteSubTask);

router.get('/:id',middleware.getUserAuthorized, taskController.getTask);
router.post('/',middleware.getUserAuthorized, v.validate(TaskModel), taskController.addTask);
router.post('/:id',middleware.getUserAuthorized, v.validate(TaskModel), taskController.updateTask);
router.post('/status/:id',middleware.getUserAuthorized, v.validate(TaskStatusModel), taskController.updateTaskStatus);

// Export the express.Router() instance to be used by server.ts
export const TaskRoute: Router = router;
