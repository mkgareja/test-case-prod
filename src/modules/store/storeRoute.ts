// Import only what we need from express
import { Router } from 'express';
import { Middleware } from '../../middleware';
import { Validator } from '../../validate';
import { StoreController } from './storeController';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const storeController = new StoreController();
const middleware = new Middleware();

router.get('/:id',middleware.getUserAuthorized,storeController.getStoreByID);
router.get('/category/:id',middleware.getUserAuthorized,storeController.getStore);
router.get('/',middleware.getUserAuthorized,storeController.getStore);
// Export the express.Router() instance to be used by server.ts
export const StoreRoute: Router = router;
