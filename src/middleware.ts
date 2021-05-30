import { Request, Response } from 'express';
import * as mysql from 'jm-ez-mysql';
import { isEmpty } from 'lodash';

import { Constants } from './config/constants';
import { Tables, UserTable, DeviceTable,OrganizationTable } from './config/tables';
import { Jwt } from './helpers/jwt';

export class Middleware {
  public loadSocketUser = async (req: any, token: string, next) => {
    const tokenInfo = Jwt.decodeAuthToken(token);
    if (tokenInfo) {
      const user = await mysql.first(
        Tables.USER,
        [UserTable.ID, UserTable.EMAIL],
        `${UserTable.ID} = ? AND ${UserTable.IS_ENABLE} = 1`,
        [tokenInfo.userId]
      );
      if (user) {
        if (user.verified) {
          const data = {
            user,
          };
          next({ error: false, data });
        } else {
          next({
            error: true,
            message: req.t('ERR_TOKEN_EXP'),
          });
        }
      } else {
        next({
          error: true,
          message: req.t('ERR_TOKEN_EXP'),
        });
      }
    } else {
      next({
        error: true,
        message: req.t('ERR_TOKEN_EXP'),
      });
    }
  };

  public getUserGuestAuthorized = async (req: any, res: Response, next: () => void) => {
    if (req.headers.authorization && !isEmpty(req.headers.authorization)) {
      try {
        const tokenInfo = Jwt.decodeAuthToken(req.headers.authorization.toString());
        if (tokenInfo) {
          const user = await mysql.first(
            `${Tables.USER} u LEFT JOIN ${Tables.DEVICE} d ON u.${UserTable.ID} = d.${DeviceTable.USER_ID}`,
            [
              `u.${UserTable.ID}`,
              `u.${UserTable.FIRSTNAME}`,
              `u.${UserTable.LASTNAME}`,
              `u.${UserTable.EMAIL}`,
              `u.${UserTable.MOBILE_NUMBER}`,
              `d.${DeviceTable.LANGUAGE}`,
            ],
            `u.${UserTable.ID} = ? AND d.${DeviceTable.ID} = ${tokenInfo.deviceId}
              AND u.${UserTable.IS_ENABLE} = 1 AND u.${UserTable.IS_DELETE} = 0`,
            [tokenInfo.userId]
          );

          if (user) {
            if (user.verified) {
              req._user = user;
              next();
            } else {
              res
                .status(Constants.PRECONDITION_FAILED)
                .json({ error: req.t('USER_NOT_VERIFIED'), code: Constants.PRECONDITION_FAILED });
              return;
            }
          } else {
            res
              .status(Constants.UNAUTHORIZED_CODE)
              .json({ error: req.t('ERR_UNAUTH'), code: Constants.UNAUTHORIZED_CODE });
            return;
          }
        } else {
          res
            .status(Constants.UNAUTHORIZED_CODE)
            .json({ error: req.t('ERR_UNAUTH'), code: Constants.UNAUTHORIZED_CODE });
          return;
        }
      } catch (error) {
        res.status(Constants.INTERNAL_SERVER_ERROR_CODE).json({
          error: req.t('ERR_INTERNAL_SERVER'),
          code: Constants.INTERNAL_SERVER_ERROR_CODE,
        });
        return;
      }
    } else {
      next();
    }
  };
  public checkDomain = async (req: any, res: Response, next: () => void) => {
    if (req.body) {
      try {
        const domain = await mysql.first(
          `${Tables.ORGANIZATION}`,
          [
            `${OrganizationTable.ID}`,
          ],
          `${OrganizationTable.NAME} = ? AND ${UserTable.IS_ENABLE} = 1 AND ${UserTable.IS_DELETE} = 0`,
          [req.body.domain]
        );
        if (domain) {
          res
            .status(Constants.SUCCESS_CODE)
            .json({ msg: 'Team Name not available',code:400 });
          return;
        } else {
          res
            .status(Constants.SUCCESS_CODE)
            .json({ msg: 'Looks good',code:200 });
          return;
        }
      } catch (error) {
        res
        .status(Constants.SUCCESS_CODE)
        .json({ msg: 'Team Name not available',code:400 });
        return;
      }
    } else {
      res
      .status(Constants.SUCCESS_CODE)
      .json({ msg: 'Team Name not available',code:400 });
      return;
    }
  };

  public getUserAuthorized = async (req: any, res: Response, next: () => void) => {
    if (req.headers.authorization && !isEmpty(req.headers.authorization)) {
      try {
        const tokenInfo = Jwt.decodeAuthToken(req.headers.authorization.toString());
        if (tokenInfo) {
          const user = await mysql.first(
            `${Tables.USER}`,
            [
              `${UserTable.ID}`,
              `${UserTable.FIRSTNAME}`,
              `${UserTable.LASTNAME}`,
              `${UserTable.EMAIL}`,
              `${UserTable.ORGANIZATION}`
            ],
            `${UserTable.ID} = ? AND ${UserTable.IS_ENABLE} = 1 AND ${UserTable.IS_DELETE} = 0`,
            [tokenInfo.userId]
          );

          if (user) {
            const byPassRoutesForVerifiedCheck = [
              '/verify-otp',
              '/request-otp',
              '/verify-updated-email-otp',
              '/verify-updated-mobile-otp',
            ];
            if (user || byPassRoutesForVerifiedCheck.includes(req.route.path)) {
              req._user = user;
              req._user.deviceId = tokenInfo.deviceId;
              next();
            } else {
              res
                .status(Constants.PRECONDITION_FAILED)
                .json({ error: req.t('USER_NOT_VERIFIED'), code: Constants.PRECONDITION_FAILED });
              return;
            }
          } else {
            res
              .status(Constants.UNAUTHORIZED_CODE)
              .json({ error: req.t('ERR_UNAUTH'), code: Constants.UNAUTHORIZED_CODE });
            return;
          }
        } else {
          res
            .status(Constants.UNAUTHORIZED_CODE)
            .json({ error: req.t('ERR_UNAUTH'), code: Constants.UNAUTHORIZED_CODE });
          return;
        }
      } catch (error) {
        res.status(Constants.INTERNAL_SERVER_ERROR_CODE).json({
          error: req.t('ERR_INTERNAL_SERVER'),
          code: Constants.INTERNAL_SERVER_ERROR_CODE,
        });
        return;
      }
    } else {
      const byPassRoutesForVerifiedCheck = [
        '/name',
        '/store/:sid',
        '/login-duration',
        '/',
        '/:id',
        '/category/:id',
        '/store',
        '/product'
      ];
      if(byPassRoutesForVerifiedCheck.includes(req.route.path)) {
        next();
      }else{
          res
          .status(Constants.UNAUTHORIZED_CODE)
          .json({ error: req.t('ERR_UNAUTH'), code: Constants.UNAUTHORIZED_CODE });
        return;
      }
    }
  };
}
