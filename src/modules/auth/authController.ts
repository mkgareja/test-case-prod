import { Constants } from './../../config/constants';
import bcryptjs = require('bcryptjs');
import { Request, Response } from 'express';
import { Jwt } from '../../helpers/jwt';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { SendEmail } from '../../helpers/sendEmail';
import { AuthUtils } from './authUtils';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export class AuthController {
    private authUtils: AuthUtils = new AuthUtils();

    public signup = async (req: any, res: Response) => {
        const deviceId = req.body.deviceId;
        // delete req.body.deviceId;
        let salt = bcryptjs.genSaltSync(10);
        let hash = bcryptjs.hashSync(req.body.password, salt);

        // creating user in SOL CDK
        const uuid = uuidv4();
        const customerData = { customerId: uuid }
        const obj = {
            firstname: req.body.firstname,
            email: req.body.email,
            password: hash,
            zipcode: req.body.zipcode,
            isEnable: 1,
            isDelete:0,
            createdAt: new Date()
        }
        const deviceObj = {
            deviceType: req.body.devicetype,
            deviceToken: req.body.deviceId,
            createdAt: new Date()
        }
        // creating user profile
        const result: ResponseBuilder = await this.authUtils.createUser(obj);

        if (result && result.result && result.result.id) {
            await this.authUtils.updateDeviceInformation({ uId: result.result.id }, deviceId);
            // JWT token
            const userDetails = {
                id:result.result.id,
                token: Jwt.getAuthToken({ userId: result.result.id, deviceId }),
                status:true,
                firstname:req.body.firstname,
                email: req.body.email,
                password: req.body.password,
                zipcode: req.body.zipcode,
                devicetype:req.body.devicetype,
                role:req.body.role,
                deviceId:req.body.deviceId,
                msg: req.t('SIGNUP_LOGIN_SUCCESS'),
            };
            const replaceData = {
                '{USERNAME}': req.body.firstname
              };
            SendEmail.sendRawMail('welcome', replaceData, req.body.email,req.t('WELCOME'));
            res.status(result.code).json(userDetails); // sending only JWT token in response
        } else {
            res.status(result.code).json(result.result); // sending error if any
        }
    };

    // update user
    public updateUser = async (req: any, res: Response) => {
        const obj = {
            firstname: req.body.firstname,
            email: req.body.email,
            zipcode: req.body.zipcode
        }
        const result: ResponseBuilder = await this.authUtils.updateUser(req.params.id,obj);
        if(result.result.status == true){
            result.msg= req.t('USER_UPDATED_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };

    public requestOtp = async (req: any, res: Response) => {
        const { countryCode, mobileNumber } = req.query;
        const request = await this.authUtils.sendOtp(`+${countryCode}`, mobileNumber);
        request.result.registered
            ? res.status(request.code).json(request.result)
            : res.status(Constants.NOT_FOUND_CODE).json({ error: req.t('ERR_NO_USER_FOUND') });
    };

    // Sign in api
    public login = async (req: any, res: Response) => {
        const deviceId = req.body.deviceId;
        // assign device to this created user

        await this.authUtils.updateDeviceInformation({ uId: req.body._authentication.uid }, deviceId);
        const obj = {
            lastLogin: new Date()
        }
        await this.authUtils.updateUser(req.body._authentication.uid ,obj);
        const userDetails = {
            status:true,
            msg: req.t('LOGIN_SUCCESS'),
            token: Jwt.getAuthToken({
                userId: req.body._authentication.uid,
                deviceId,
            }),
            id: req.body._authentication.uid,
            email: req.body._authentication.email,
            firstname: req.body._authentication.firstname,
            zipcode: req.body._authentication.zipcode,
        };
        res.status(Constants.SUCCESS_CODE).json(userDetails);
    };

    // Forgot Password
    public forgotPassword = async (req: any, res: Response) => {
        // checking user is exist or not in DB
        const { email } = req.body;
        let password;
        password = await this.authUtils.sendEmail( email);
        const result = {
            status:true
        }
        password.result.registered
            ? res.status(password.code).json(result)
            : res.status(Constants.NOT_FOUND_CODE).json({ error: req.t('ERR_NO_USER_FOUND') });
    };

    // Reset your password
    public resetPassword = async (req: any, res: Response) => {
        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(req.body.password, salt);
        const updateDetails = {
            password: hash,
        };
        await this.authUtils.updateUserDetails(updateDetails, req._user.uid); // update new password in DB
        res.status(Constants.SUCCESS_CODE).json({ msg: req.t('PASSWORD_RESET') });
    };

    // Change password
    public changePassword = async (req: any, res: Response) => {
        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(req.body.newPassword, salt);
        // req.body.newPassword = bcryptjs.hashSync(req.body.newPassword, Constants.HASH_STRING_LIMIT);
        await this.authUtils.updateUserDetails({ password: hash }, req._user.uid);
        res.status(Constants.SUCCESS_CODE).json({ msg: req.t('PASSWORD_UPDATED') });
    };

    // Add login information
    public setDeviceInfo = async (req: Request, res: Response) => {
        req.body.language = isNaN(req.body.language) ? 1 : req.body.language;
        const newDevice: ResponseBuilder = await this.authUtils.setDeviceInformation(req.body);
        res.status(newDevice.code).json(newDevice.result);
    };

    // Unassigned user from device - on logout this api will be called on client side
    public unassignDevice = async (req: any, res: Response) => {
        const result = await this.authUtils.updateDeviceInformation({ uId: null },req._user.deviceId);
        if(result.result.status == true){
            res.status(Constants.SUCCESS_CODE).json({ statu:true,msg: req.t('USER_LOGOUT') });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ statu:false,msg: req.t('ERR_NO_DATA_FOUND') });
        }
    };
}
