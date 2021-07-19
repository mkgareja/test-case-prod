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
        const orgUid = uuidv4();
        const objOrg = {
            id:orgUid,
            name: req.body.organization
        }
        const orgUserId = uuidv4();
        const objOrguser = {
            id:orgUserId,
            orgId: orgUid,
            userId:uuid
        }
        // creating user profile
        await this.authUtils.createUserOrg(objOrg);
        await this.authUtils.createUserOrgUsers(objOrguser);
        // let insertId = resultNew.insertId;
        const obj = {
            id: uuid,
            firstname: req.body.firstname,
            email: req.body.email,
            password: hash,
            organization: orgUid,
            domain: req.body.domain,
            country: req.body.country || '',
            users: req.body.users,
            mobile: req.body.mobile || ''
        }
        const result: ResponseBuilder = await this.authUtils.createUser(obj);

        if (result) {
            // await this.authUtils.updateDeviceInformation({ uId: result.result.id }, deviceId);
            // JWT token
            // let deviceId =
            const userDetails = {
                id:uuid,
                token: Jwt.getAuthToken({ userId: uuid, deviceId:123 }),
                status:true,
                firstname:req.body.firstname,
                email: req.body.email,
                password: req.body.password,
                msg: req.t('SIGNUP_LOGIN_SUCCESS'),
            };
            const link =`https://${obj.domain}.oyetest.com`
            this.authUtils.sendEmailSignup(obj.email, link,req.body.password,obj.firstname)
            res.status(result.code).json(userDetails); // sending only JWT token in response
        } else {
            res.status(result.code).json(result.result); // sending error if any
        }
    };
    public getOrgUsers = async (req: any, res: Response) => {
        let result = await this.authUtils.getProjectsUser(req.params.id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    }
    public getUsers = async (req: any, res: Response) => {
        let result = await this.authUtils.getUser(req.params.pid,req.params.oid);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    }
    public inviteUser = async (req: any, res: Response) => {
        // delete req.body.deviceId;
        let salt = bcryptjs.genSaltSync(10);
        let hash = bcryptjs.hashSync(req.body.password, salt);

        // creating user in SOL CDK
        const uuid = uuidv4();
        const obj = {
            id:uuid,
            email: req.body.email
        }
        // creating user profile
        const result: ResponseBuilder = await this.authUtils.createUser(obj);

        if (result) {
            // await this.authUtils.updateDeviceInformation({ uId: result.result.id }, deviceId);
            // JWT token
            // let deviceId =
            const userDetails = {
                email: req.body.email,
                msg: req.t('SIGNUP_LOGIN_SUCCESS'),
            };
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
    public updateUserRole = async (req: any, res: Response) => {
        const obj = {
            role: 2,
        }
        const result: ResponseBuilder = await this.authUtils.updateUserByEmail(req.body.email,obj);
        if(result.result.status == true){
            result.msg= req.t('USER_UPDATED_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };
    // update user
    public updateUserInvite = async (req: any, res: Response) => {
        const user = await this.authUtils.checkUserEmailExistsInvite(req.body.email);
        if (user) {
            let salt = bcryptjs.genSaltSync(10);
            let hash = bcryptjs.hashSync(req.body.password, salt);

            const obj = {
                firstname: req.body.firstname,
                password: hash,
                isEnable:1,
                users: req.body.users,
                mobile: req.body.mobile||''
            }
            // creating user profile
            const result: ResponseBuilder = await this.authUtils.updateUser(user.id, obj);
            const userDetails = {
                id: user.id,
                token: Jwt.getAuthToken({ userId: user.id, deviceId: 123 }),
                status: true,
                firstname: req.body.firstname,
                email: req.body.email,
                organization:user.organization,
                msg: req.t('SIGNUP_LOGIN_SUCCESS'),
            };
            res.status(result.code).json(userDetails);
        } else {
            const userDetails = {
                msg: 'invalid user'
            }
            res.status(Constants.NOT_FOUND_CODE).json(userDetails);
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
    
        // assign device to this created user
        const userDetails = {
            status:true,
            msg: req.t('LOGIN_SUCCESS'),
            token: Jwt.getAuthToken({
                userId: req.body._authentication.id,
                deviceId:123,
            }),
            id: req.body._authentication.id,
            email: req.body._authentication.email,
            firstname: req.body._authentication.firstname,
            organization: req.body._authentication.organization,
            domain: req.body._authentication.domain
        };
        res.status(Constants.SUCCESS_CODE).json(userDetails);
    };

    // Forgot Password
    public forgotPassword = async (req: any, res: Response) => {
        // checking user is exist or not in DB
        const { email } = req.body;
        // let password:any;
        let password:any = await this.authUtils.sendEmail(email);
        const result = {
            status:true,
            value:(password.result.otp * 2)
        }
        password.result.registered
            ? res.status(password.code).json(result)
            : res.status(Constants.NOT_FOUND_CODE).json({ error: req.t('ERR_NO_USER_FOUND') });
    };

    // Forgot Password
    public sendContactEmail = async (req: any, res: Response) => {
        // checking user is exist or not in DB
        const { name, email, msg } = req.body;
        await this.authUtils.sendContactEmail(name, email, msg );
        res.status(Constants.SUCCESS_CODE).json({ msg: 'We receeived your query. We will get back to you soon' });
    };

    // Reset your password
    public resetPassword = async (req: any, res: Response) => {
        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(req.body.password, salt);
        const updateDetails = {
            password: hash,
        };
        await this.authUtils.updateUserDetails(updateDetails, req._user.id); // update new password in DB
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

    public get = async (req: any, res: Response) => {
        res.status(Constants.SUCCESS_CODE).json({ statu:true,msg: req.t('USER_LOGOUT') });
        
    };
}
