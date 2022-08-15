import { Router } from 'express';
import { Validator } from '../../validate';
import { ResultController } from './resultController';
import { Middleware } from '../../middleware';
import { ResultModel } from './resultModel';

const middleware = new Middleware();
const router: Router = Router();
const v: Validator = new Validator();
const resultController = new ResultController();

router.post('/:id', middleware.getUserAuthorized, v.validate(ResultModel), resultController.updateSubtaskResult);

export const ResultRoute: Router = router;