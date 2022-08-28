import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ProjectUtils } from './projectUtils';
import { v4 as uuidv4 } from 'uuid';
import { AuthUtils } from '../auth/authUtils';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import * as CryptoJS from 'crypto-js';
import { ResultUtils } from '../result/resultUtils';
const getPropValues = (o, prop) => (res => (JSON.stringify(o, (key, value) => (key === prop && res.push(value), value)), res))([]);

export class ProjectController {
    private authUtils: AuthUtils = new AuthUtils();
    private projectUtils: ProjectUtils = new ProjectUtils();
    private resultUtils: ResultUtils = new ResultUtils();
    public getProject = async (req: any, res: Response) => {
        let result;
        if (req._user.role == 1 || req._user.role == 2) {
            result = await this.projectUtils.getProjectsByOrg(req._user.organization);
        }else{
            result = await this.projectUtils.getProjects(req._user.id);
        }
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getOrgUsersInvited = async (req: any, res: Response) => {
        let result = await this.authUtils.getOrgEmailWithName(req.params.oid);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    }
    public getTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        try {
            let result = await this.projectUtils.getTask(id);
            res.status(Constants.SUCCESS_CODE).json(result);
        } catch (err) {
            console.log(`Error at getting task, error: ${err}`);
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        };
    };
    public addProject = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const uuid2 = uuidv4();
        const projectObj = {
            id:uuid,
            name: req.body.name,
            type: req.body.type,
            userid:req._user.id,
            description:req.body.description,
            createdAt: new Date()
        }
        const projectObjnew = {
            id:uuid2,
            projectid: uuid,
            userid:req._user.id,
            orgid:req._user.organization
        }
        // creating user profile
        const result:any = await this.projectUtils.addProject(projectObj);
        await this.projectUtils.addProjectUsers(projectObjnew);
        const msg = req.t('PROJECT_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.newDevice, projectid: uuid });
    };
    public addUserToProject = async (req: any, res: Response) => {
        const uuid2 = uuidv4();
        const projectObjnew = {
            id: uuid2,
            projectid: req.body.pid,
            userid: req.body.uid,
            role:0,
            orgid:req._user.organization
        }
        await this.projectUtils.addProjectUsers(projectObjnew);
        const msg = 'User added successfully ';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
    }
    public removeUserToProject = async (req: any, res: Response) => {
        await this.projectUtils.deleteUserProject(req.body.uid,req.body.pid);
        const msg = 'User removed successfully ';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
    }
    public inviteInProject = async (req: any, res: Response) => {
        const uuid2 = uuidv4();
        const uuid = uuidv4();
        let ciphertext = CryptoJS.AES.encrypt(req.body.email, 'secretkey123').toString();
        ciphertext=ciphertext.toString().replace('+','xMl3Jk').replace('/','Por21Ld').replace('=','Ml32');
        const user = await this.authUtils.checkUserEmailExistsInvite(req.body.email);
        if (user) {
            if (user.isEnable) {
                const checkExists = await this.projectUtils.checkUserOrgExists(user.id,req.body.orgId);
                if (checkExists) {
                    const msg = 'User Already exist in organization';
                    res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
                } else {
                    const projectObjnew = {
                        id: uuid2,
                        projectid: req.body.pid,
                        userid: user.id
                    }
                    // await this.projectUtils.addProjectUsers(projectObjnew);
                    const orgUserId = uuidv4();
                    const objOrguser = {
                        id:orgUserId,
                        orgId: req.body.orgId,
                        userId:user.id
                    }
                    // creating user profile
                    await this.authUtils.createUserOrgUsers(objOrguser);
                    if(req.body.projects){
                         req.body.projects.forEach(element => {
                            const uuid2 = uuidv4();
                            const projectObjnew = {
                                id: uuid2,
                                projectid: element.id,
                                userid: user.id,
                                role:0,
                                orgid:req._user.organization
                            }
                            this.projectUtils.addProjectUsers(projectObjnew);
                        });
                    }
                    
                    const msg = 'User added successfully ';
                    res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
                }
            }else{
                await this.authUtils.sendEmailLink(req.body.email, `https://${user.domain}.oyetest.com/invite?id=${ciphertext}`)
                const msg = 'User added and invited successfully ';
                res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
            }
        } else {
            const userDetail = await this.projectUtils.getUserByOrg(req.body.orgId);
            if (userDetail) {
                const obj = {
                    id: uuid,
                    email: req.body.email,
                    isInvite: 1,
                    role:0,
                    isEnable:0,
                    organization:userDetail[0].organization,
                    domain:userDetail[0].domain,
                    country:userDetail[0].country
                }
                // creating user profile
                await this.authUtils.createUser(obj);
                const orgUserId = uuidv4();
                const objOrguser = {
                    id:orgUserId,
                    orgId: req.body.orgId,
                    userId:uuid
                }
                // creating user profile
                await this.authUtils.createUserOrgUsers(objOrguser);
                // const projectObjnew = {
                //     id: uuid2,
                //     projectid: req.body.pid,
                //     userid: uuid
                // }
                // await this.projectUtils.addProjectUsers(projectObjnew);
                if(req.body.projects){
                    req.body.projects.forEach(element => {
                       const uuid2 = uuidv4();
                       const projectObjnew = {
                           id: uuid2,
                           projectid: element.value,
                           userid: uuid,
                           role:0,
                           orgid:req._user.organization
                       }
                       this.projectUtils.addProjectUsers(projectObjnew);
                   });
               }
                await this.authUtils.sendEmailLink(req.body.email, `https://${userDetail[0].domain}.oyetest.com/invite?id=${ciphertext}`)
                const msg = 'User added and invited successfully ';
                res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
            }
        }

        // creating user profile
        // const result:any = await this.projectUtils.addProject(projectObj);

        // const msg = req.t('PROJECT_ADDED');
        // res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.newDevice });
    };
    public addEmailOrg = async (req: any, res: Response) => {
        const objOrg = {
            id: uuidv4(),
            email: req.body.email,
            orgId: req.body.orgId
        }
        const result:ResponseBuilder = await this.authUtils.updateOrgEmail(objOrg);
        const msg = 'Email added successfully';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
    };
    public removeEmailOrg = async (req: any, res: Response) => {
        const objOrg = {
            isEnable:0
        }
        await this.projectUtils.removeEmailOrg(objOrg,req.body.id);
        const msg = 'Email removed successfully ';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
    }
    public updateProject = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            name: req.body.name,
            type: req.body.type,
            userid:req._user.id,
            description:req.body.description
        }
        const result:ResponseBuilder = await this.projectUtils.updateProject(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('REVIEW_UPDATED_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }

    public updateTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            data:JSON.stringify(req.body.data)
        }
        const result:ResponseBuilder = await this.projectUtils.updateProject(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }

    public updateField = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            field:JSON.stringify(req.body.data)
        }
        const result:ResponseBuilder = await this.projectUtils.updateProject(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public addTestRun = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const { id = null } = req.params;
        const tasks = await this.projectUtils.getTask(id);
        if (!tasks.data[0]) {
            res.status(Constants.SUCCESS_CODE).json({ code: 400, msg: 'No test cases found' });
        } else {
            const tempObj = {
                id: uuid,
                name: req.body.name,
                userid: req._user.id,
                projectid: id,
                createdAt: new Date(),
                description: req.body.description,
                isProcessing:1
            }
            const result: any = await this.projectUtils.addTestRun(tempObj);
            await this.resultUtils.addResultAndSubtaskResult(id);
            if (result.result.status == true) {
                const msg = req.t('TEST_RUN_ADDED');
                res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
            } else {
                res.status(Constants.INTERNAL_SERVER_ERROR_CODE).json(result);
            }
        }
    }
    public getObjects = async (obj, key, val, newVal) => {
        let newValue = newVal;
        let objects = [];
        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val, newValue));
            } else if (i == key && obj[key] == val) {
                obj['flag'] = newVal;
                obj['testing'] = 'automated';
            }
        }
        return obj;
    }
    public updateTestRun = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let projectObj;
        let flag = req.body.flag || '';
        if (flag) {
            let result = await this.projectUtils.getTestRun(id);
            let finalData = JSON.parse(result[0].data);
            let newData = await this.getObjects(finalData, 'id', req.body.tid, flag)
            projectObj = {
                data: JSON.stringify(newData),
                updatedBy: req._user.id,
                updatedAt: new Date(),
                isProcessing: 0

            }
        } else if (req.body.isProcessing) {
            projectObj = {
                data: JSON.stringify(req.body.data),
                updatedBy: req._user.id,
                updatedAt: new Date(),
                isProcessing: 0

            }
        } else {
            projectObj = {
                data: JSON.stringify(req.body.data),
                updatedBy: req._user.id,
                updatedAt: new Date()
            }
        }

        const result: ResponseBuilder = await this.projectUtils.updateTestRun(id, projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TEST_RUN_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public getTestRun = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.projectUtils.getTestRun(id);
        let finalData = JSON.parse(result[0].data);
        let finalField = JSON.parse(result[0].field);
        let resArray = getPropValues(finalData, "status");
        let temp_count = {
            pass: resArray.filter(x => x == 'pass').length,
            failed: resArray.filter(x => x == 'failed').length,
            block: resArray.filter(x => x == 'block').length,
            fail: resArray.filter(x => x == 'fail').length,
            untested: resArray.filter(x => x == 'untested').length
        }
        if(result[0].data){
            res.status(Constants.SUCCESS_CODE).json({ status: true, count: temp_count, data: finalData, field: finalField });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getTestRunByProject = async (req: any, res: Response) => {
        const { id = null } = req.params;
        try {
            let result = await this.projectUtils.getTestRunByProject(id);
            res.status(Constants.SUCCESS_CODE).json(result);
        } catch (err) {
            console.log(`Error at getting testRun, error: ${err}`);
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        };
    };
    public sendTestRunEmail = async (req: any, res: Response) => {
        const { id = null } = req.body;
        const { orgId = null } = req.body;
        const { pname = null } = req.body;

        let result = await this.projectUtils.getTestRun(id);
        let emails=[];
        const userEmail = await this.authUtils.getOrgEmail(orgId);
        userEmail.forEach(element => {
            emails.push(element.email)
        });
        // console.log(JSON.stringify(emails))
        let finalData = JSON.parse(result[0].data);
        let resArray = getPropValues(finalData, "status");
        let temp_count = {
            pass: resArray.filter(x => x == 'pass').length,
            failed: resArray.filter(x => x == 'failed').length,
            block: resArray.filter(x => x == 'block').length,
            fail: resArray.filter(x => x == 'fail').length,
            untested: resArray.filter(x => x == 'untested').length
        }
        let  emailCount;
        let testCases='';
        try {
        emailCount = temp_count

        } catch (error) {
            console.log(error)
        }

        const objFinal ={
            result:emailCount,
            testCases:testCases,
            pname:pname,
            testName:result[0].name
        }
        this.projectUtils.sendEmailResult(emails,objFinal)
        // if(result[0].data){
            res.status(Constants.SUCCESS_CODE).json({ status: true});
        // }else{
        //     res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        // }

    };
    public getTestRuns = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.projectUtils.getTestRuns(id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getOrgEmail = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.projectUtils.getAllEmail(id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getTestRunsAnalytics = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const { limit = null } = req.params;
        let result = await this.projectUtils.getTestRunsAnalytics(id,limit);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public  deleteProject = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            isDelete:1
        }
        const result:ResponseBuilder = await this.projectUtils.updateProject(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('PROJECT_DELETE_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
}
