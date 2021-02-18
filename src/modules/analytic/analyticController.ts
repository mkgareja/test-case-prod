import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { AnalyticUtils } from './analyticUtils';
import { isEmpty } from 'lodash';

export class AnalyticController {
    private analyticUtils: AnalyticUtils = new AnalyticUtils();
    public addTime = async (req: any, res: Response) => {
        let deviceId;
        let timeObj;
        if (req.headers.deviceid && !isEmpty(req.headers.deviceid)) {
            deviceId = req.headers.deviceid;
        }
        if (req._user && req._user.uid) {
            timeObj = {
                userId: req._user.uid,
                openAt: req.body.openAt,
                closeAt: req.body.closeAt,
                createdAt: new Date()
            }
        } else {
            timeObj = {
                deviceId,
                openAt: req.body.openAt,
                closeAt: req.body.closeAt,
                createdAt: new Date()
            }
        }
        const result = await this.analyticUtils.addTime(timeObj);
        result.msg = req.t('TIME_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ data: result });
    };

    public async addPageCount(req: any,page:string){
        let deviceId;
        let pageObj;
        if (req.headers.deviceid && !isEmpty(req.headers.deviceid)) {
            deviceId = req.headers.deviceid;
        }
        if(req._user && req._user.uid){
            pageObj = {
                page,
                userId:req._user.uid,
                createdAt: new Date()
            }
        }else{
            pageObj = {
                page,
                deviceId,
                createdAt: new Date()
            }
        }
        await this.analyticUtils.addPageCount(pageObj);
    }
    public async addSearchKeyCount(req: any,key:string){
        if (req.headers.deviceid && !isEmpty(req.headers.deviceid) && !isEmpty(key)) {
            const deviceId = req.headers.deviceid;
            const keyObj = {
                key,
                deviceId
            }
            await this.analyticUtils.addSearchKeyCount(keyObj);
        }
    }
}
