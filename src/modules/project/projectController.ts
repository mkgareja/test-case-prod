import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ProjectUtils } from './projectUtils';
import { v4 as uuidv4 } from 'uuid';
import { ResponseBuilder } from '../../helpers/responseBuilder';
const getPropValues = (o, prop) => (res => (JSON.stringify(o, (key, value) => (key === prop && res.push(value), value)), res))([]);

export class ProjectController {
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
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: JSON.parse(result[0].data) });
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
    public addTestRun = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const { id = null } = req.params;
        const tasks = await this.projectUtils.getTask(id);

        const tempObj = {
            id: uuid,
            name: req.body.name,
            userid: req._user.id,
            projectid: id,
            data:tasks[0].data,
            createdAt: new Date(),
            description:req.body.description
        }
        const resTempObj = {
            id: uuid,
            name: req.body.name,
            userid: req._user.id,
            projectid: id,
            data:JSON.parse(tasks[0].data),
            createdAt: new Date(),
            description:req.body.description
        }
        let resArray = getPropValues(resTempObj.data, "status");
        let temp_count = {
            pass: resArray.filter(x => x == 'pass').length,
            failed: resArray.filter(x => x == 'failed').length,
            block: resArray.filter(x => x == 'block').length,
            fail: resArray.filter(x => x == 'fail').length
        }
        // creating user profile
        const result:any = await this.projectUtils.addTestRun(tempObj);
        const msg = req.t('TEST_RUN_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, count:temp_count,data: resTempObj });
    }
    public updateTestRun = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            data:JSON.stringify(req.body.data)
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
        let finalData = JSON.parse(result[0].data );
        let resArray = getPropValues(finalData, "status");
        let temp_count = {
            pass: resArray.filter(x => x == 'pass').length,
            failed: resArray.filter(x => x == 'failed').length,
            block: resArray.filter(x => x == 'block').length,
            fail: resArray.filter(x => x == 'fail').length,
            untested: resArray.filter(x => x == 'untested').length
        }
        if(result[0].data){
            res.status(Constants.SUCCESS_CODE).json({ status: true, count:temp_count,data: finalData });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
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
