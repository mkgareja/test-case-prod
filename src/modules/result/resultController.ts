import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ResultUtils } from '../result/resultUtils';
import { ResponseBuilder } from '../../helpers/responseBuilder';

export class ResultController {
    private resultUtils: ResultUtils = new ResultUtils();

    public updateSubtaskResult = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const resultObj = {
            testStatus:req.body.status
        }
        const result:ResponseBuilder = await this.resultUtils.updateSubtaskResult(id, resultObj);
        if (result.result.status == true) {
            const msg = req.t('SUBTASK_RESULT_UPDATED');
            res.status(Constants.SUCCESS_CODE).json({ code: 200, msg: msg, data: result.result.res, subtaskResultId: id});
        } else {
            const msg = req.t('SUBTASK_RESULT_NOT_FOUND');
            res.status(Constants.NOT_FOUND_CODE).json({ code: Constants.NOT_FOUND_CODE, msg: msg, data: result.result });
        }
    }

    public bulkUpdateSubtaskStatus = async (req: any, res: Response) => {
        const result = [];
        const reqBody = req.body;
        if (reqBody.length > 50) {
            return res.status(Constants.FAIL_CODE).json({ msg: req.t('BULK_UPDATE_FAIL'), code: Constants.FAIL_CODE });
        }
        for (let item of reqBody) {
            const statusObj = {
                testStatus: item.status,
            };
            if ("subtaskId" in item) {
                const temp = await this.resultUtils.updateSubtaskResult(item.subtaskId, statusObj);
                if (temp.result.status == true) {
                    result.push({ subtaskId: item.subtaskId, msg: req.t('SUBTASK_RESULT_UPDATED'), data: temp.result.res});
                } else {
                    result.push({ subtaskId: item.subtaskId, msg: req.t('SUBTASK_RESULT_UPDATE_FAIL'), data: temp.result.res});
                }
            } else if ("taskId" in item) {
                const temp = await this.resultUtils.updateAllSubtaskStatus(item.taskId, statusObj);
                if (temp.result.status == true) {
                    result.push({ taskId: item.taskId, msg: req.t('TASK_RESULT_UPDATED'), data: temp.result.res});
                } else {
                    result.push({ taskId: item.taskId, msg: req.t('TASK_RESULT_UPDATE_FAILED'), data: temp.result.res});
                }
            }
        }
        return res.status(Constants.SUCCESS_CODE).json(result);
    }
}