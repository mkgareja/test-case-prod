import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { TaskUtils } from './taskUtils';
import { v4 as uuidv4 } from 'uuid';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { ResultUtils } from '../result/resultUtils';

export class TaskController {
    private taskUtils: TaskUtils = new TaskUtils();
    private resultUtils: ResultUtils = new ResultUtils();
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
            title:req.body.title
        }
        const result:any = await this.taskUtils.addTask(infoObj);
        if (result.result.status == true) {
            const msg = req.t('TASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res, taskId: uuid });
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };

    private async getSubTaskObj(uuid: any, body: any) {
        let infoObj: any = {
            id:uuid,
            projectid: body.projectid,
            taskid: body.taskid,
            title: body.title,
            subid: body.details.subid || null,
            description: body.details.description || null,
            summary: body.details.summary || null,
            browser: body.details.browser || null,
            os: body.details.os || null,
            testing: body.details.testing || 'manual',
            username: body.details.username,
            field: null
        };
        if (body.details.field != undefined && body.details.field.length != 0) {
            infoObj.field = JSON.stringify(body.details.field);
        }
        return infoObj;
    }

    public addSubTask = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const infoObj = await this.getSubTaskObj(uuid, req.body);
        const result:any = await this.taskUtils.addSubTask(infoObj);
        if (result.result.status == true) {
            const msg = req.t('SUBTASK_ADDED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res, subTaskId: uuid });
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };

    public updateTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            projectid: req.body.projectid,
            title:req.body.title
        }
        const result:ResponseBuilder = await this.taskUtils.updateTask(id,projectObj);
        if (result.result.status == true) {
            const msg = req.t('TASK_UPDATED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res, taskId: id});
        } else {
            const msg = req.t('TASK_NOT_FOUND');
            res.status(Constants.NOT_FOUND_CODE).json({ code: Constants.NOT_FOUND_CODE, msg: msg, data: result.result });
        }
    }

    public updateSubTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const infoObj = await this.getSubTaskObj(id, req.body);
        const result:ResponseBuilder = await this.taskUtils.updateSubTask(id, infoObj);
        if (result.result.status == true) {
            const msg = req.t('SUBTASK_UPDATED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res, subTaskId: id });
        } else {
            const msg = req.t('SUBTASK_NOT_FOUND');
            res.status(Constants.NOT_FOUND_CODE).json({ code: Constants.NOT_FOUND_CODE, msg: msg, data: result.result });
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
        const result2:ResponseBuilder = await this.taskUtils.bulkUpdateSubtasks(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('TASK_SUBTASK_DELETED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result.result.status == true ? result2 : result);
        }
    }
    public deleteSubTask = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const projectObj = {
            isDelete: req.body.isDelete
        }
        const result:ResponseBuilder = await this.taskUtils.updateSubTask(id,projectObj);
        if (result.result.status == true) {
            result.msg = req.t('SUBTASK_DELETED');
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
