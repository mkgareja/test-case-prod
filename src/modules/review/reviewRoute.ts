// Import only what we need from express
import { Router } from 'express';
import { Middleware } from '../../middleware';
import { Validator } from '../../validate';
import { ReviewController } from './reviewController';
import { ReviewMiddleware } from './reviewMiddleware';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const reviewController = new ReviewController();
const middleware = new Middleware();
const reviewMiddleware = new ReviewMiddleware();

import {
  ReviewModel
} from './reviewModel';

router.post('/store', middleware.getUserAuthorized, v.validate(ReviewModel),reviewMiddleware.checkReviewExist,reviewController.addReviewStore);
router.get('/store', middleware.getUserAuthorized, reviewController.getReview);
router.delete('/store/:srid', middleware.getUserAuthorized, reviewController.deleteReview);
router.post('/store/:id', middleware.getUserAuthorized,  v.validate(ReviewModel),reviewController.updateReviewStore);

router.get('/product', middleware.getUserAuthorized, reviewController.getReview);
router.delete('/product/:prid', middleware.getUserAuthorized, reviewController.deleteReview);
router.post('/product/:id', middleware.getUserAuthorized, v.validate(ReviewModel), reviewController.updateReviewProduct);
// Export the express.Router() instance to be used by server.ts
export const ReviewRoute: Router = router;
