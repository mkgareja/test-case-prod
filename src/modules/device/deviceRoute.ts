// Import only what we need from express
import { Router } from 'express';
import { Validator } from '../../validate';
import { DeviceController } from './deviceController';

import {
    DeviceModel
} from './deviceModel';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const deviceController = new DeviceController();

router.post('/', v.validate(DeviceModel), deviceController.addDevice);
// Export the express.Router() instance to be used by server.ts
export const DeviceRoute: Router = router;
