import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ProjectUtils } from './projectUtils';
import { v4 as uuidv4 } from 'uuid';
import { AuthUtils } from '../auth/authUtils';
import { ResponseBuilder } from '../../helpers/responseBuilder';
const getPropValues = (o, prop) => (res => (JSON.stringify(o, (key, value) => (key === prop && res.push(value), value)), res))([]);

export class ProjectController {
    private authUtils: AuthUtils = new AuthUtils();
    private projectUtils: ProjectUtils = new ProjectUtils();
    public getProject = async (req: any, res: Response) => {
        let result = await this.projectUtils.getProjects(req._user.id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.projectUtils.getTask(id);
        if(result[0].data){
            res.status(Constants.SUCCESS_CODE).json({ status: true,field:JSON.parse(result[0].field), data: JSON.parse(result[0].data) });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
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
            userid:req._user.id
        }
        // creating user profile
        const result:any = await this.projectUtils.addProject(projectObj);
        await this.projectUtils.addProjectUsers(projectObjnew);
        const msg = req.t('PROJECT_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.newDevice });
    };
    public addUserToProject = async (req: any, res: Response) => {
        const uuid2 = uuidv4();
        const projectObjnew = {
            id: uuid2,
            projectid: req.body.pid,
            userid: req.body.uid
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
                    const msg = 'User added successfully ';
                    res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
                }
            }
        } else {
            const userDetail = await this.projectUtils.getUserByOrg(req.body.orgId);
            if (userDetail) {
                const obj = {
                    id: uuid,
                    email: req.body.email,
                    isInvite: 1,
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
                await this.authUtils.sendEmailLink(req.body.email, `https://${userDetail[0].domain}.oyetest.com/invite`)
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
        if (!tasks[0].data) {
            res.status(Constants.SUCCESS_CODE).json({ code: 400, msg: 'No test cases found' });
        } else {
            const tempObj = {
                id: uuid,
                name: req.body.name,
                userid: req._user.id,
                projectid: id,
                data: tasks[0].data,
                field: tasks[0].field,
                createdAt: new Date(),
                description: req.body.description
            }
            const resTempObj = {
                id: uuid,
                name: req.body.name,
                userid: req._user.id,
                projectid: id,
                data: JSON.parse(tasks[0].data),
                field: JSON.parse(tasks[0].field),
                createdAt: new Date(),
                description: req.body.description,
                isProcessing:1
            }
            let resArray = getPropValues(resTempObj.data, "status");
            let temp_count = {
                pass: resArray.filter(x => x == 'pass').length,
                failed: resArray.filter(x => x == 'failed').length,
                block: resArray.filter(x => x == 'block').length,
                fail: resArray.filter(x => x == 'fail').length
            }
            // creating user profile
            const result: any = await this.projectUtils.addTestRun(tempObj);
            const msg = req.t('TEST_RUN_ADDED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, count: temp_count, data: resTempObj });
        }
    }
    public updateTestRun = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let projectObj;
        if (req.body.isProcessing) {
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
        
        const result:ResponseBuilder = await this.projectUtils.updateTestRun(id,projectObj);
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
        let result = await this.projectUtils.getTestRunByProject(id);
        let finalData ;
        let finalField;
        let resArray ;
        let temp_count;
        if(result){
         finalData = JSON.parse(result.data);
         finalField = JSON.parse(result.field);
         resArray = getPropValues(finalData, "status");
         temp_count = {
            pass: resArray.filter(x => x == 'pass').length,
            failed: resArray.filter(x => x == 'failed').length,
            block: resArray.filter(x => x == 'block').length,
            fail: resArray.filter(x => x == 'fail').length,
            untested: resArray.filter(x => x == 'untested').length
        }}
        if(result && result.data){
            res.status(Constants.SUCCESS_CODE).json({ id:result.id,status: true, count: temp_count, data: finalData, field: finalField });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
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
