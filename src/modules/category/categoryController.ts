import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { CategoryUtils } from './categoryUtils';
import { Utils } from '../../helpers/utils';
import { AnalyticController } from '../analytic/analyticController';

export class CategoryController {
    private categoryUtils: CategoryUtils = new CategoryUtils();
    private analyticController = new AnalyticController();
    public getCategory = async (req: any, res: Response) => {
        const result = await this.categoryUtils.getCategory();
        this.analyticController.addPageCount(req,Constants.PAGES.HOME.value);
            if(result.result.status === true){
                const finalResult=result.result.data;
                finalResult.map((detail)=>{
                    detail.image = detail.image !=='' ? Utils.formatStringObjectsToArrayObjects(detail, 'image'): null;
                    if (detail.image) {
                            detail.image.id = detail.image.id;
                            detail.image.original = process.env.MEDIA_SERVER_PATH+'/'+detail.image.original;
                            detail.image.thumb = process.env.MEDIA_SERVER_PATH+'/'+detail.image.thumb;
                        }
                    });
                res.status(Constants.SUCCESS_CODE).json(result);
            }else{
                res.status(Constants.NOT_FOUND_CODE).json(result);
            }
    };

}
