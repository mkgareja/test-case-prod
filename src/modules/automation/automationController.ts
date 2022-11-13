import { Request, Response } from 'express';
import { Constants } from '../../config/constants';
import { ProjectUtils } from '../project/projectUtils';
import { AutomationUtils } from './automationUtils';

export class AutomationController {

    private projectUtils: ProjectUtils = new ProjectUtils();
    private automationUtils: AutomationUtils = new AutomationUtils();

    public getProjects = async (req: any, res: Response) => {
        const pageNum = req.query.page ? parseInt(req.query.page) > 0 ? parseInt(req.query.page) - 1 : 0 : Constants.PAGINATION_PAGE_NUM;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : Constants.PAGINATION_PAGE_SIZE;
        const offset = pageNum * pageSize;
        let result: any;
        if (req._user.role == 1 || req._user.role == 2) {
            result = await this.projectUtils.getProjectsByOrg(req._user.organization, offset, pageSize);
        }else{
            result = await this.projectUtils.getProjects(req._user.id, offset, pageSize);
        }
        if(result){
            const data = await this.automationUtils.setProjects(result);
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: data });
        } else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        }
    };

    public getProject = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.projectUtils.getProject(id);
        if (result) {
            const data = await this.automationUtils.setProjects(result);
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: data });
        } else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        }
    }

    public getTasksSubtasks = async (req: any, res: Response) => {
        const { pid = null } = req.params;
        const pageNum = req.query.page ? parseInt(req.query.page) > 0 ? parseInt(req.query.page) - 1 : 0 : Constants.PAGINATION_PAGE_NUM;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : Constants.PAGINATION_PAGE_SIZE;
        const skip = pageNum * pageSize;
        try {
            let result = await this.projectUtils.getTask(pid, skip, pageSize);
            const data = await this.automationUtils.setTasksSubtasks(result);
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: data});
        } catch (err) {
            console.log(`Error at getting task, error: ${err}`);
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        };
    }

}