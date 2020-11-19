// Import only what we need from express
import { Router } from 'express';
import { Middleware } from '../../middleware';
import { Validator } from '../../validate';
import { ProductController } from './productController';
import { ProductMiddleware } from './productMiddleware';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const productController = new ProductController();
const middleware = new Middleware();
const productMiddleware = new ProductMiddleware();

import {
    ProductModel
  } from './productModel';
router.get('/', productController.getProduct);
router.get('/name', middleware.getUserAuthorized,productController.getProductByname);
router.get('/store/:sid',middleware.getUserAuthorized, productController.getProductByStore);
router.post('/:id/review',middleware.getUserAuthorized,v.validate(ProductModel),productMiddleware.checkReviewExist,productController.productReview);
// Export the express.Router() instance to be used by server.ts
export const ProductRoute: Router = router;
