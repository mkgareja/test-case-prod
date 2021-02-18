import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { StoreUtils } from './storeUtils';
import { Utils } from '../../helpers/utils';
const moment = require("moment-timezone");
import { isEmpty } from 'lodash';
import { AnalyticController } from '../analytic/analyticController';
export class StoreController {
    private storeUtils: StoreUtils = new StoreUtils();
    private analyticController = new AnalyticController();
    public getStoreByID = async (req: any, res: Response) => {
        const isStore='true';
        const sid = req.params.id;
        let isEdit = false;
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;
        const resultStore = await this.storeUtils.getStore(isStore,sid,latitude,longitude);
        const resultProduct = await this.storeUtils.getProductsByStore(sid);
        const storeTime = await this.storeUtils.getStoreTime(sid);
        let storeStatus = Constants.STORE_STATUS_DEFAULT;
        let isReview = null;
        if(req._user && req._user.uid){
            const isStoreReview = await this.storeUtils.isReviewStore(req._user.uid,sid);
            if(isStoreReview){
                isEdit = true;
                isReview=isStoreReview;
                isReview.rating = parseFloat(isReview.rating);
            }
        }

        this.analyticController.addPageCount(req,Constants.PAGES.STORE_DETAIL.value);

        if(storeTime.length>0){
                try {
                    // will get est time
                    // wiil check for day
                    // will check that time is in btween or not
                    const estTime = moment.tz(Constants.TIMEZONE_EST).format(Constants.MOMENT_DAY).toLowerCase();
                    let finalDay;
                    if(estTime == Constants.DAYS.saturday || estTime == Constants.DAYS.sunday){
                        finalDay=estTime;
                    }else{
                        finalDay=Constants.DAYS.weekdays;
                    }
                    const time = moment.tz(Constants.TIMEZONE_EST).format(Constants.TIME_FORMATE_STORE_OPEN_CLOSE);
                    const storeTimeNew = storeTime;
                    const selectedDayStoreTime = storeTimeNew.filter((arr)=>{return arr.day == finalDay})[0];

                    const format = Constants.TIME_FORMATE_STORE_OPEN_CLOSE;
                    if(!isEmpty(selectedDayStoreTime)){
                        const timeFinal = moment(time,format);
                        const beforeTime = moment(selectedDayStoreTime.openTime, format);
                        const afterTime = moment(selectedDayStoreTime.closeTime, format);

                        if (timeFinal.isBetween(beforeTime, afterTime)) {
                            storeStatus=Constants.STORE_STATUS_OPEN;
                        } else {
                            storeStatus=Constants.STORE_STATUS_CLOSE;
                        }
                    }

                } catch (error) {
                    res.status(Constants.NOT_FOUND_CODE).json({ status:false,msg:error});
                }

                storeTime.map((detail)=>{
                    detail.closeTime = moment(detail.closeTime, Constants.TIME_FORMATE_STORE).format( Constants.TIME_FORMATE_STORE)
                    detail.openTime = moment(detail.openTime, Constants.TIME_FORMATE_STORE).format( Constants.TIME_FORMATE_STORE)
                })
        }
        if(resultStore.result.status === true ){
            const store = await this.mergeImagePath(resultStore.result.data);
            const storeProduct = await this.mergeImagePath(resultProduct);
            store[0].product = storeProduct;
            store[0].store_status = storeStatus;
            store[0].time = storeTime;
            store[0].isEdit = isEdit;
            store[0].isReview = isReview;
            res.status(Constants.SUCCESS_CODE).json({ status:true,data: store[0]});
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status:false,msg: req.t('NO_DATA')});
        }
    };

    public async mergeImagePath(rs:any) {
        rs.map((detail)=>{
            detail.image = detail.image !=='' ? Utils.formatStringObjectsToArrayObjects(detail, 'image'): null;
            if (detail.image) {
                    detail.image.original = process.env.MEDIA_SERVER_PATH+'/'+detail.image.original;
                    detail.image.thumb = process.env.MEDIA_SERVER_PATH+'/'+detail.image.thumb;
                }
            });
        return rs;
    }

    public getStore = async (req: any, res: Response) => {
        const cid = (req.params.id)?req.params.id:'';
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;
        this.analyticController.addPageCount(req,Constants.PAGES.STORE_LIST.value);
        const resultStore = await this.storeUtils.getStore('',cid,latitude,longitude);
        if(resultStore.result.status === true ){
            const store = await this.mergeImagePath(resultStore.result.data);
            res.status(Constants.SUCCESS_CODE).json({ status:true,data: store});
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({status:false,msg: req.t('NO_DATA')});
        }
    };
}
