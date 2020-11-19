import { Constants } from '../../config/constants';
import { Response } from 'express';
import { ReviewUtils } from './reviewUtils';
import * as moment from 'moment';
import { ResponseBuilder } from '../../helpers/responseBuilder';

export class ReviewController {
    private reviewUtils: ReviewUtils = new ReviewUtils();
    public getReview = async (req: any, res: Response) => {
        const { sid = null } = req.query;
        const { pid = null } = req.query;
        const { skip = 1 } = req.query;
        const { upcCode = '' } = req.query;
        const { productname = '' } = req.query;
        const uid = (req._user && req._user.uid )?req._user.uid:'';
        let storeFlag;
        let id;
        if (sid != null) {
            storeFlag = true;
            id = sid;
        } else {
            storeFlag = false;
            id = pid;
        }
        const limit = Constants.LIMIT;
        let finalResult = [];
        const rowcount = await this.reviewUtils.getUsersReviewCount(storeFlag, id,upcCode,productname);
        if (rowcount[0].total > 0) {
            const result = await this.reviewUtils.getUsersReview(storeFlag, id, skip, limit,uid,upcCode,productname);
            if (result.result.status === true) {
                finalResult = result.result.data;
                if (storeFlag === true) {
                    finalResult.map(v => {
                        v.createdAt = moment(v.createdAt).format(Constants.DATE_REVIEW_FORMAT),
                        v.rating= parseFloat(v.rating),
                        v.isEdit = (uid && uid == v.sruid) ? true : false
                    });
                } else {
                    finalResult.map(v => {
                        v.createdAt = moment(v.createdAt).format(Constants.DATE_REVIEW_FORMAT),
                        v.rating= parseFloat(v.rating),
                        v.isEdit = (uid && uid == v.pruid) ? true : false
                    });
                }
                res.status(Constants.SUCCESS_CODE).json({ rowcount: rowcount[0].total, data: finalResult, rowsOnPage: Constants.LIMIT });
            } else {
                res.status(Constants.NOT_FOUND_CODE).json({ msg: req.t('NO_REVIEW') });
            }
        } else {
            res.status(Constants.NOT_FOUND_CODE).json({ msg: req.t('NO_REVIEW'), data: finalResult });
        }
    };

    public updateReviewStore = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const storeFlag = true;
        this.updateReview(req, res, storeFlag, id);
    };

    public addReviewStore = async (req: any, res: Response) => {
        const { sid = null } = req.query;
        const details = {
            rating: req.body.rating,
            title: (req.body.title)?req.body.title:'',
            description: req.body.description,
            sid,
            uId: req._user.uid,
            isEnable: 1,
            isDelete: 0,
            createdAt: new Date()
        }
        const result = await this.reviewUtils.addReviewStore(details);
        if (result.result.status === true) {
            result.msg = req.t('REVIEW_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };

    public updateReviewProduct = async (req: any, res: Response) => {
        const { id = null } = req.params;
        const storeFlag = false;
        this.updateReview(req, res, storeFlag, id);
    };

    public async updateReview(req: any, res: Response, storeFlag, id) {
        const reviewObj = {
            rating: req.body.rating,
            title: req.body.title,
            description: req.body.description,
            updatedAt: new Date()
        }
        const result: ResponseBuilder = await this.reviewUtils.updateReview(id,reviewObj,storeFlag);
        if (result.result.status == true) {
            result.msg = req.t('REVIEW_UPDATED_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
    public deleteReview= async(req: any, res: Response) =>{
        const {  srid = null } = req.params;
        const {  prid = null } = req.params;
        let storeFlag;
        let id;
        if(srid!=null){
             storeFlag = true;
             id = srid;
        }else{
            storeFlag = false;
            id = prid;
        }
        const result: ResponseBuilder = await this.reviewUtils.deleteReview(id,storeFlag);
        if (result.result.status == true) {
            result.msg = req.t('REVIEW_DELETE_SUCCESS');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            result.msg = req.t('INVALID_REVIEW_ID');
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    }
}
