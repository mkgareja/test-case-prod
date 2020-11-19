import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { ProductUtils } from './productUtils';
import { ReviewUtils } from '../review/reviewUtils';
import { Utils } from '../../helpers/utils';
import { meanBy ,uniqBy,isEmpty} from 'lodash';
import * as moment from 'moment';
import { AnalyticController } from '../analytic/analyticController';
let i=0;
export class ProductController {
    private productUtils: ProductUtils = new ProductUtils();
    private reviewUtils: ReviewUtils = new ReviewUtils();
    private analyticController = new AnalyticController();
    public getProduct = async (req: any, res: Response) => {
        const productname = req.query.productname;
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;
        const sid = (req.query.sid)?req.query.sid:'';
        const dsort = (req.query.dsort)?req.query.dsort:'';
        const psort = (req.query.psort)?req.query.psort:'';
        const lrange = req.query.lrange;
        const hrange = req.query.hrange;
        const rating = req.query.rating;
        this.analyticController.addPageCount(req,Constants.PAGES.SEARCH.value);
        this.analyticController.addSearchKeyCount(req,productname);
        const finalResult = await this.recursiveCall(sid,productname,latitude,longitude,dsort,psort,lrange,hrange,rating,Constants.RADIUS_ARRAY[i]);
        if(finalResult){
            finalResult.map((detail) => {
                detail.image = detail.image !== '' ? Utils.formatStringObjectsToArrayObjects(detail, 'image') : null;
                detail.image.map((img) => {
                    if (img) {
                        img.original = process.env.MEDIA_SERVER_PATH + '/' + img.original;
                        img.thumb = process.env.MEDIA_SERVER_PATH + '/' + img.thumb;
                    }
                })
            });
            const finalop = await this.mergeImage(finalResult);

            if(finalop){
                let filteredArray = finalop.map((v)=> {
                    return (v.upcCode || v.productname);
                });
                filteredArray = filteredArray.filter((item, index, inputArray) =>{
                    return inputArray.indexOf(item) == index;
                });
                const finalarray = [];
                filteredArray.forEach((entry) => {
                    let storearray = [];
                    const ex = finalop.filter((item, index, inputArray) => {
                        return (item.upcCode || item.productname) == entry;
                    });
                    ex.forEach((entry1) => {
                        const u = {
                            sid:entry1.sid,
                            price:`${Constants.CURRENCY} ${entry1.price.toFixed(2)}`,
                            addressLine1: entry1.addressLine1,
                            addressLine2: entry1.addressLine2,
                            distance: entry1.distance,
                            storename:entry1.storename,
                            pid:entry1.pId,
                            storeAverageRating:entry1.storeAverageRating
                        }
                        storearray.push(u)
                    })
                    storearray = uniqBy(storearray,(e) =>{return e.sid;});
                    if(!isEmpty(sid)){
                        const r = {
                            image:ex.find(x => x.image != null)?.image[0] || null,
                            storename:ex[0].storename,
                            pId:ex[0].pId,
                            cId:ex[0].cId,
                            productname: ex[0].productname,
                            description:ex[0].description,
                            title:ex[0].title,
                            upcCode:(ex[0].upcCode)?ex[0].upcCode:'',
                            averageRating:ex.find(x => x.averageRating !== null)?.averageRating || null,
                        }
                        finalarray.push(r)
                    }else{
                        const r = {
                            image:ex.find(x => x.image != null)?.image[0] || null,
                            storename:ex[0].storename,
                            pId:ex[0].pId,
                            cId:ex[0].cId,
                            stores_count:ex.length,
                            productname: ex[0].productname,
                            upcCode:(ex[0].upcCode)?ex[0].upcCode:'',
                            averageRating:ex.find(x => x.averageRating !== null)?.averageRating || null,
                            store: storearray
                        }
                        finalarray.push(r)
                    }
                });
                if(finalarray.length === 0){
                    res.status(Constants.SUCCESS_CODE).json({ status:false,data:[], msg:req.t('NO_DATA')});
                }else{
                    res.status(Constants.SUCCESS_CODE).json({ status:true,data: finalarray });
                }
            }else{
                res.status(Constants.NOT_FOUND_CODE).json({ status:false,msg: req.t('NO_DATA') });
            }
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ status:false,msg: req.t('NO_DATA') });
        }
    };

    public getProductByStore = async (req: any, res: Response) => {
        const sid = req.params.sid;
        const productname = req.query.productname;
        const pid = req.query.pid;
        const longitude = req.query.longitude;
        const upcCode = (req.query.upcCode) ? req.query.upcCode : '';
        const latitude = req.query.latitude;
        const uid = (req._user && req._user.uid) ? req._user.uid : '';
        let finalResult;
        let productReviewFinal;
        this.analyticController.addPageCount(req, Constants.PAGES.PODUCT_DETAIL.value);
        const result = await this.productUtils.getProductByStore(pid, latitude, longitude, '', '');
        const productReview: any = await this.reviewUtils.getUsersReview(false, pid, 1, Constants.LIMIT, uid, upcCode, productname);
        if (result.result.status === true) {
            finalResult = result.result.data;
        } else {
            finalResult = [];
        }

        let reviewarray = [];
        let isEdit;
        productReviewFinal = productReview.result.data;
        productReviewFinal.map((entry1) => {
            if (uid && uid == entry1.pruid) {
                isEdit = true;
            } else {
                isEdit = false;
            }
            if (entry1.prId != null) {
                const v = {
                    rating: parseFloat(entry1.rating),
                    title: entry1.title,
                    description: entry1.description,
                    createdAt: moment(entry1.createdAt).format(Constants.DATE_REVIEW_FORMAT),
                    firstname: entry1.firstname,
                    prId: entry1.prId,
                    isEdit
                }
                reviewarray.push(v)
            }
        })
        const averageRating = meanBy(reviewarray, 'rating');
        const totalReview = await this.reviewUtils.getUsersReviewCount(false, pid, '', '')
        finalResult = finalResult.filter((rs) => { return rs.sid == sid })
        finalResult.map((detail) => {
            detail.image = detail.image !== '' ? Utils.formatStringObjectsToArrayObjects(detail, 'image') : null;
            detail.image.map((img) => {
                if (img) {
                    img.original = process.env.MEDIA_SERVER_PATH + '/' + img.original;
                    img.thumb = process.env.MEDIA_SERVER_PATH + '/' + img.thumb;
                }
            })
        });
        const finalop = await this.mergeImage(finalResult);

        if (finalop) {
            let filteredArray = finalop.map((v) => {
                return v.productname;
            });

            filteredArray = filteredArray.filter((item, index, inputArray) => {
                return inputArray.indexOf(item) == index;
            });
            const finalarray = [];
            filteredArray.forEach((entry) => {
                const storearray = [];
                const ex = finalop.filter((item, index, inputArray) => {
                    return item.productname == entry;
                });
                ex.forEach((entry1) => {
                    const u = {
                        sid: entry1.sid,
                        storename: entry1.storename,
                        addressLine1: entry1.addressLine1,
                        addressLine2: entry1.addressLine2,
                        distance: entry1.distance,
                        storeAverageRating: entry1.storeAverageRating
                    }
                    storearray.push(u)
                })
                const r = {
                    image: (ex[0].image[0]) ? ex[0].image[0] : null,
                    price: `${Constants.CURRENCY} ${ex[0].price.toFixed(2)}`,
                    title: ex[0].title,
                    pId: ex[0].pId,
                    cId: ex[0].cId,
                    stores_count: ex.length,
                    description: ex[0].description,
                    productname: ex[0].productname,
                    upcCode: (ex[0].upcCode) ? ex[0].upcCode : '',
                    store: storearray[0],
                    review: reviewarray,
                    averageRating,
                    totalReview: (totalReview.total) ? totalReview.total : 0
                }
                finalarray.push(r)
            });
            if (finalarray.length === 0) {
                res.status(Constants.SUCCESS_CODE).json({ status: false, data: [], msg: req.t('NO_DATA') });
            } else {
                res.status(Constants.SUCCESS_CODE).json({ status: true, data: finalarray.filter((row, index) => index < 1) });
            }
        } else {
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, msg: req.t('NO_DATA') });
        }
    };

    public getProductByname = async (req: any, res: Response) => {
        const productname = req.query.productname;
        const longitude = req.query.longitude;
        const latitude = req.query.latitude;
        const upcCode = (req.query.upcCode) ? req.query.upcCode : '';
        const uid = (req._user && req._user.uid) ? req._user.uid : '';
        let finalResult;
        let productReviewFinal;
        const result = await this.productUtils.getProductByStore('', latitude, longitude, upcCode, productname);
        const productReview: any = await this.reviewUtils.getUsersReview(false, '', 1, Constants.LIMIT, uid, upcCode, productname);
        if (result.result.status == true) {
            finalResult = result.result.data;
        } else {
            finalResult = [];
        }

        let reviewarray = [];
        let isEdit;
        productReviewFinal = productReview.result.data;
        productReviewFinal.map((entry1) => {
            if (uid && uid == entry1.pruid) {
                isEdit = true;
            } else {
                isEdit = false;
            }
            if (entry1.prId) {
                if (entry1.prId != null) {
                    const v = {
                        prId: entry1.prId,
                        rating: parseFloat(entry1.rating),
                        title: entry1.title,
                        description: entry1.description,
                        createdAt: moment(entry1.createdAt).format(Constants.DATE_REVIEW_FORMAT),
                        firstname: entry1.firstname,
                        isEdit
                    }
                    reviewarray.push(v)
                }
            }
        })
        const averageRating = meanBy(reviewarray, 'rating');
        const totalReview = await this.reviewUtils.getUsersReviewCount(false, '', upcCode, productname);

        finalResult.map((detail) => {
            detail.image = detail.image !== '' ? Utils.formatStringObjectsToArrayObjects(detail, 'image') : null;
            detail.image.map((img) => {
                if (img) {
                    img.original = process.env.MEDIA_SERVER_PATH + '/' + img.original;
                    img.thumb = process.env.MEDIA_SERVER_PATH + '/' + img.thumb;
                }
            })
        });
        const finalop = await this.mergeImage(finalResult);

        if (finalop) {
            let filteredArray = finalop.map((v) => {
                return v.productname;
            });

            filteredArray = filteredArray.filter((item, index, inputArray) => {
                return inputArray.indexOf(item) == index;
            });
            const finalarray = [];
            filteredArray.forEach((entry) => {
                const storearray = [];
                const ex = finalop.filter((item, index, inputArray) => {
                    return item.productname == entry;
                });
                ex.forEach((entry1) => {
                    const u = {
                        sid: entry1.sid,
                        storename: entry1.storename,
                        addressLine1: entry1.addressLine1,
                        addressLine2: entry1.addressLine2,
                        distance: entry1.distance,
                        storeAverageRating: entry1.storeAverageRating
                    }
                    storearray.push(u)
                })
                const finalstore = uniqBy(storearray, (e) => { return e.sid; });
                const r = {
                    image: (ex[0].image[0]) ? ex[0].image[0] : null,
                    price: `${Constants.CURRENCY} ${ex[0].price.toFixed(2)}`,
                    title: ex[0].title,
                    pId: ex[0].pId,
                    cId: ex[0].cId,
                    stores_count: ex.length,
                    description: ex[0].description,
                    productname: ex[0].productname,
                    upcCode: (ex[0].upcCode) ? ex[0].upcCode : '',
                    stores: finalstore,
                    review: reviewarray,
                    averageRating,
                    totalReview: (totalReview.total) ? totalReview.total : 0
                }
                finalarray.push(r)
            });
            if (finalarray.length === 0) {
                res.status(Constants.SUCCESS_CODE).json({ status: false, data: [], msg: req.t('NO_DATA') });
            } else {
                res.status(Constants.SUCCESS_CODE).json({ status: true, data: finalarray.filter((row, index) => index < 1) });
            }
        } else {
            res.status(Constants.NOT_FOUND_CODE).json({ status: false, msg: req.t('NO_DATA') });
        }
    };


    public productReview = async (req: any, res: Response) => {
        const details = {
            rating: req.body.rating,
            title: (req.body.title)?req.body.title:'',
            description: req.body.description,
            pId: req.params.id,
            uId: req._user.uid,
            isEnable: 1,
            isDelete: 0,
            createdAt: new Date()
        }
        this.analyticController.addPageCount(req, Constants.PAGES.RATING.value);
        const result = await this.productUtils.addReview(details);
        if (result.result.status === true) {
            result.msg = req.t('REVIEW_ADDED');
            res.status(Constants.SUCCESS_CODE).json(result);
        } else {
            res.status(Constants.NOT_FOUND_CODE).json(result);
        }
    };
    public async mergeImage(rs:any) {
        const output = [];

            rs.forEach((item) => {
                const existing = output.filter((v) =>{
                    return v.pId == item.pId;
                });
                if (existing.length && item.image != null) {
                    const existingIndex = output.indexOf(existing[0]);
                    if(output[existingIndex].image!=null){
                        output[existingIndex].image = output[existingIndex].image.concat(item.image);
                    }
                } else {
                    if (item.image){
                        item.image = [item.image];
                    }
                    output.push(item);
                }
            });

            return output;
    };

    public async recursiveCall(sid,productname,latitude,longitude,dsort,psort,lrange,hrange,rating,radius){
        const result = await this.productUtils.getProduct(sid,productname,latitude,longitude,dsort,psort,lrange,hrange,rating,radius);
        if(result.result.status === true){
            return result.result.data;
        }else{
            if(i<(Constants.RADIUS_ARRAY.length-1)){
                i++;
                await this.recursiveCall(sid,productname,latitude,longitude,dsort,psort,lrange,hrange,rating,Constants.RADIUS_ARRAY[i]);
            }else{
                return [];
            }
        }
    }

}
