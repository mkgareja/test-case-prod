import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ProjectUtils } from './projectUtils';

export class ProjectController {
    private projectUtils: ProjectUtils = new ProjectUtils();
    public addProject = async (req: any, res: Response) => {
        const deviceObj = {
            deviceType: req.body.devicetype,
            deviceToken: req.body.deviceId,
            createdAt: new Date()
        }
        // creating user profile
        const result = await this.projectUtils.addProject(deviceObj);
        result.msg = req.t('DEVICE_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ data: result });
    };
}
