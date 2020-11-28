import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { TaskUtils } from './taskUtils';
import { v4 as uuidv4 } from 'uuid';
import { ResponseBuilder } from '../../helpers/responseBuilder';

export class TaskController {
    private taskUtils: TaskUtils = new TaskUtils();
    public getTask = async (req: any, res: Response) => {
        let TaskResult = await this.taskUtils.getTasks(req.params.id);
        let SubTaskResult = await this.taskUtils.getSubTasks(req.params.id);
        let op = TaskResult.map((e,i)=>{
            let temp = SubTaskResult.filter(x => x.taskid === e.id);
            e.subtask = temp;
            return e;
          })
        if(SubTaskResult){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: op });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public addTask = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const infoObj = {
            id:uuid,
            projectid: req.body.projectid,
            status: req.body.status,
            title:req.body.title
        }
        // creating user profile
        const result:any = await this.taskUtils.addTask(infoObj);
        const msg = req.t('TASK_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res });
    };
    public addSubTask = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const infoObj = {
            id:uuid,
            projectid: req.body.projectid,
            taskid: req.body.taskid,
            status: req.body.status,
            title:req.body.title
        }
        // creating user profile
        const result:any = await this.taskUtils.addSubTask(infoObj);
        const msg = req.t('SUBTASK_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res });
    };
    public updateTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            projectid: req.body.projectid,
            status: req.body.status,
            title:req.body.title
        }
        const result:ResponseBuilder = await this.taskUtils.updateTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public updateSubTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            projectid: req.body.projectid,
            taskid: req.body.taskid,
            status: req.body.status,
            title: req.body.title
        }
        const result:ResponseBuilder = await this.taskUtils.updateSubTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public updateTaskStatus = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            status: req.body.status,
        }
        const result:ResponseBuilder = await this.taskUtils.updateTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public updateSubTaskStatus = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            status: req.body.status,
        }
        const result:ResponseBuilder = await this.taskUtils.updateSubTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public deleteTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            isDelete: req.body.isDelete
        }
        const result:ResponseBuilder = await this.taskUtils.updateTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public deleteSubTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            isDelete: req.body.isDelete
        }
        const result:ResponseBuilder = await this.taskUtils.updateSubTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public deleteProject = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            isDelete:1
        }
        const result:ResponseBuilder = await this.taskUtils.updateTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('PROJECT_DELETE_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
}
