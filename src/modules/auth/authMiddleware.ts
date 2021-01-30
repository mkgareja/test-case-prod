import bcryptjs = require('bcryptjs');
import { Request, Response } from 'express';
import * as mysql from 'jm-ez-mysql';
import * as moment from 'moment';

import { Constants } from '../../config/constants';
import { Tables, UserTable } from '../../config/tables';
import { AuthUtils } from './authUtils';
import * as path from 'path';
import { SendEmail } from '../../helpers/sendEmail';

export class AuthMiddleware {
  private authUtils: AuthUtils = new AuthUtils();

  public checkCredentials = async (req: any, res: Response, next: () => void) => {
    // get user detail by email address
    const user = await this.authUtils.checkUserEmailExists(req.body.email);

    // check credentials matches or not
    if (user && (await bcryptjs.compare(req.body.password, user.password))) {
      if (user.isEnable) {
        if (req.body == 'localhost' || req.body == '' || req.body == 'oyetest' || req.body == user.domain) {
          req.body._authentication = user;
          next();
        } else {
          res
            .status(Constants.UNAUTHORIZED_CODE)
            .json({ error: 'Invalid Domain', code: Constants.NOT_FOUND_CODE });
        }
      } else {
        res
          .status(Constants.PRECONDITION_FAILED)
          .json({ error: req.t('USER_NOT_ACTIVE'), code: Constants.PRECONDITION_FAILED });
        return;
      }
    } else {
      res
        .status(Constants.UNAUTHORIZED_CODE)
        .json({ error: req.t('INVALID_CREDENTIALS'), code: Constants.NOT_FOUND_CODE });
    }
  };

  public checkDeviceExists = async (req: any, res: Response, next: () => void) => {
    // get user detail by email address
    const device = await this.authUtils.checkDeviceRegistered(+req.params.deviceId);

    // check credentials matches or not
    if (device && device.id) {
      next();
    } else {
      res
        .status(Constants.UNAUTHORIZED_CODE)
        .json({ error: req.t('DEVICE_NOT_REGISTERED'), code: Constants.UNAUTHORIZED_CODE });
    }
  };

  public IsRecoveryCodeVerified = async (req: any, res: Response, next: () => void) => {
    const user = await mysql.first(
      Tables.USER,
      [UserTable.ID, UserTable.RECOVERY_CODE],
      `${UserTable.EMAIL} = ?`,
      [req.body.email]
    );
    if (req.body.recoveryCode !== Constants.MASTER_OTP && req.body.recoveryCode !== user.recoveryCode) {
      res.status(Constants.FAIL_CODE).json({ error: req.t('ERR_OTP_NOT_MATCH') });
    } else {
        req._user = user;
        next();
    }
  };

  public IsOTPVerified = async (req: any, res: Response, next: () => void) => {
    if (req._user) {
      req.body.mobileNumber = req._user.mobileNumber;
    }
    const otpDetail = await mysql.first(
      Tables.USER,
      [UserTable.ID, UserTable.OTP_EXPIRED_AT, UserTable.OTP],
      `${UserTable.MOBILE_NUMBER} = ?`,
      [req.body.mobileNumber]
    );
    if (req.body.otp !== Constants.MASTER_OTP && req.body.otp !== otpDetail.otp) {
      res.status(Constants.FAIL_CODE).json({ error: req.t('ERR_OTP_NOT_MATCH') });
    } else {
      const today = moment(new Date()).utc().format(Constants.DATA_BASE_DATE_TIME_FORMAT);
      const date = otpDetail.otpExpireAt;
      if (req.body.otp !== Constants.MASTER_OTP && moment(today).diff(date, 'seconds') > 2) {
        res.status(Constants.FAIL_CODE).json({ error: req.t('ERR_OTP_EXPIRE') });
      } else {
        req._user = otpDetail;
        next();
      }
    }
  };

  public IsEmailAlreadyExistOnUpdate = async (req: any, res: Response, next: () => void) => {
    const user = await mysql.first(Tables.USER, [UserTable.ID], `${UserTable.EMAIL} = ?`, [
      req.body.email,
    ]);
    if (user && user.id === req._user.id) {
      next();
    } else {
      res
        .status(Constants.FAIL_CODE)
        .json({ error: req.t('USER_EMAIL_EXIST'), code: Constants.FAIL_CODE });
    }
  };

  public checkPassword = async (req: any, res: Response, next: () => void) => {
    // check old password is correct or not
    const { isNew } = req.query;
    if (!isNew) {
      const user = await mysql.first(
        Tables.USER,
        [UserTable.PASSWORD, UserTable.ID],
        `${UserTable.ID} = ?`,
        [req._user.uid]
      );
      if (user && (await bcryptjs.compare(req.body.oldPassword, user.password))) {
        next();
      } else {
        res
          .status(Constants.FAIL_CODE)
          .json({ error: req.t('PASSWORD_INCORRECT'), code: Constants.FAIL_CODE });
      }
    } else {
      next();
    }
  };

  public IsUpdatedEmailOTPVerified = async (req: any, res: Response, next: () => void) => {
    const templatesDir = path.resolve(`${__dirname}/../../`, 'templates');
    const content = `${templatesDir}/email-verify.html`;
    const emailDetail = await mysql.first(
      Tables.USER,
      [
        UserTable.ID,
        UserTable.EMAIL,
        UserTable.EMAIL,
      ],
      // `${UserTable.EMAIL_VERIFICATION_TOKEN} = ?`,
      [req.params.emailVerificationToken]
    );
    if (!emailDetail) {
      const replaceData = {
        '{MESSAGE}': req.t('ERR_EMAIL_VERIFY_LINK'),
      };
      const html = SendEmail.getHtmlContent(content, replaceData);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(html);
      res.end();
    } else {
      const today = moment(new Date()).utc().format(Constants.DATA_BASE_DATE_TIME_FORMAT);
      const date = emailDetail.otpExpireAt;
      if (moment(today).diff(date, 'seconds') > 1) {
        const replaceData = {
          '{MESSAGE}': req.t('ERR_EMAIL_VERIFY_EXPIRE'),
        };
        const html = SendEmail.getHtmlContent(content, replaceData);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(html);
        res.end();
      } else {
        next();
      }
    }
  };

  public assignParamsToReqBody(req: any, res: Response, next: () => void) {
    req.body.id = req._user.id;
    next();
  }
}
