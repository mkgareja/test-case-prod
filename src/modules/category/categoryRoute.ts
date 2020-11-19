// Import only what we need from express
import { Router } from 'express';
import { Middleware } from '../../middleware';
import { Validator } from '../../validate';
import { CategoryController } from './categoryController';
import { CategoryMiddleware } from './categoryMiddleware';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const categoryController = new CategoryController();
const middleware = new Middleware();
const categoryMiddleware = new CategoryMiddleware();

router.get('/', middleware.getUserAuthorized,categoryController.getCategory);
// Export the express.Router() instance to be used by server.ts
export const CategoryRoute: Router = router;
