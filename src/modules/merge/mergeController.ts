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


    public getMergeByProjectId = async (req: any, res: Response) => {
        const { id = null } = req.params;
        // const { limit = null } = req.params;
        let result = await this.mergeUtils.getMergeByProjectId(id);
        if (result) {
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        } else {
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, error: req.t('NO_DATA') });
        }
    };

    public getMergeById = async (req: any, res: Response) => {
        const { id = null } = req.params;
        let result = await this.mergeUtils.getMergeById(id);
        if (result) {
            res.status(Constants.SUCCESS_CODE).json({ status: true, data: result });
        } else {
            res.status(Constants.FAIL_CODE).json({ status: false, error: req.t('ERR_NO_DATA_FOUND') });
        }
    };

    public addMerge = async (req: any, res: Response) => {
        const isMergeExist = await this.mergeUtils.isMergeAlreadyExist(req.body.source_pid, req.body.destination_pid);
        if (isMergeExist) {
            return res.status(Constants.FAIL_CODE).json({ status: false, error: req.t('TEST_MERGE_ALREADY_EXIST') });
        }
        const uuid = uuidv4();
        const projectObj = {
            id: uuid,
            orgid: req.body.orgid,
            source_pid: req.body.source_pid,
            destination_pid: req.body.destination_pid,
            status: 0,
            userid: req._user.id,
            createdAt: new Date()
        }
        // creating user profile
        const result: any = await this.mergeUtils.addMerge(projectObj);
        const msg = 'Merge request raised successfully!';
        res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.newDevice });
    };

    public updateProject = async (req: any, res: Response) => {
        if (req.body.status > 2 || req.body.status < 1) {
            return res.status(Constants.FAIL_CODE).json({ status: false, error: req.t('TEST_MERGE_INCORRECT_STATUS') });
        }
        const currentStatus = await this.mergeUtils.getMergeStatus(req.params.id);
        if (currentStatus == req.body.status) {
            const msg = req.t('MERGE_STATUS_ALREADY_UPDATED');
            return res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
        }
        const updateMerge = {
            status: req.body.status,
            isDelete: req.body.is_delete || 0,
            reject_reason: req.body.rejectMsg || null
        }
        await this.mergeUtils.updateMerge(updateMerge, req.params.id);
        if (updateMerge.status === 1) {
            const msg = req.t('MERGE_SUCCESSFUL');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
        } else {

            // checking user is exist or not in DB
            // const { name, email } = req.body;
            // await this.authUtils.sendContactEmail(name, email, msg );

            const msg = req.t('MERGE_REJECTED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg });
        }

    }
}
