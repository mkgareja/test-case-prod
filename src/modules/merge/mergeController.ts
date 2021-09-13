import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { MergeUtils } from './mergeUtils';
import { v4 as uuidv4 } from 'uuid';
import { AuthUtils } from '../auth/authUtils';
import { ProjectUtils } from '../project/projectUtils';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import * as CryptoJS from 'crypto-js';
const getPropValues = (o, prop) => (res => (JSON.stringify(o, (key, value) => (key === prop && res.push(value), value)), res))([]);

export class MergeController {
    private authUtils: AuthUtils = new AuthUtils();
    private projectUtils: ProjectUtils = new ProjectUtils();
    private mergeUtils: MergeUtils = new MergeUtils();
   
    public getMerge = async (req: any, res: Response) => {
        const { id = null } = req.params;
        // const { limit = null } = req.params;
        let result = await this.mergeUtils.getMerge(id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public getMergeById = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.mergeUtils.getMergeById(id);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status: false,error: req.t('NO_DATA') });
        }
    };
    public addMerge = async (req: any, res: Response) => {
        const uuid = uuidv4();
        const sourceTasks = await this.projectUtils.getTask(req.body.source_pid);
        const destinationTasks = await this.projectUtils.getTask(req.body.destination_pid);

        let finalTask = JSON.parse(sourceTasks[0].data).concat(JSON.parse(destinationTasks[0].data));
        const projectObj = {
            id:uuid,
            orgid:req.body.orgid,
            source_pid: req.body.source_pid,
            destination_pid: req.body.destination_pid,
            merged_data:JSON.stringify(finalTask),
            status: 0,
            userid:req._user.id,
            createdAt: new Date()
        }
        // creating user profile
        const result:any = await this.mergeUtils.addMerge(projectObj);
        const msg = 'Merge request raised successfully!';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.newDevice });
    };
    public updateProject = async (req: any, res: Response) => {
        const updateMerge = {
            status: req.body.status
        }
        await this.mergeUtils.updateMerge(updateMerge, req.params.id);
        let msg;
        if (updateMerge.status === 1) {
            msg = 'Merged successfully ';

            let result = await this.mergeUtils.getMergeById(req.params.id);
            let finalTask = JSON.parse(result[0].merged_data);

            const projectObj = {
                data: JSON.stringify(finalTask)
            }
            await this.projectUtils.updateProject(result[0].destination_pid, projectObj);
            const projectObjNew = {
                isEnable: 0
            }
            await this.projectUtils.updateProject(result[0].source_pid, projectObjNew);
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
        } else {
            
                // checking user is exist or not in DB
            // const { name, email } = req.body;
            // await this.authUtils.sendContactEmail(name, email, msg );
            
            msg = 'Request rejected successfully';
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
        }


    }
}
