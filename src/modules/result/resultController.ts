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
}