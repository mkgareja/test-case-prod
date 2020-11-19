// Import only what we need from express
import { Router } from 'express';
import { Middleware } from '../../middleware';
import { Validator } from '../../validate';
import { AuthController } from './authController';
import { AuthMiddleware } from './authMiddleware';

import {
  AuthModel,
  LoginModel,
  ForgotPasswordModel,
  PasswordModel,
  ResetPasswordModel,
  UserModel,
  UserUpdateModel
} from './authModel';

// Assign router to the express.Router() instance
const router: Router = Router();
const v: Validator = new Validator();
const authController = new AuthController();
const middleware = new Middleware();
const authMiddleware = new AuthMiddleware();

router.post('/logout',middleware.getUserAuthorized, authController.unassignDevice);
router.post('/forgot-password', v.validate(ForgotPasswordModel),authController.forgotPassword);
router.post('/sign-up', v.validate(UserModel), authController.signup);
router.post(
  '/sign-in',
  v.validate(AuthModel),
  authMiddleware.checkCredentials,
  authController.login
);
router.post(
  '/reset-password',
  v.validate(ResetPasswordModel),
  authMiddleware.IsRecoveryCodeVerified,
  authController.resetPassword
);
router.post('/add-device', v.validate(LoginModel), authController.setDeviceInfo);
router.post(
  '/change-password',
  middleware.getUserAuthorized,
  v.validate(PasswordModel),
  authMiddleware.checkPassword,
  authController.changePassword
);
router.post('/:id', middleware.getUserAuthorized,v.validate(UserUpdateModel), authController.updateUser);

// Export the express.Router() instance to be used by server.ts
export const AuthRoute: Router = router;
