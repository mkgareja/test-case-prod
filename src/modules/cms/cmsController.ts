import { Constants } from './../../config/constants';
import { Request, Response } from 'express';
import { CMSUtils } from './cmsUtils';

export class CMSController {
    private cmsUtils: CMSUtils = new CMSUtils();
    public staticPage = async (req: any, res: Response) => {
        let result = await this.cmsUtils.getStaticPage(req.query.name);
        if(result){
            res.status(Constants.SUCCESS_CODE).json({ data: result });
        }else{
            res.status(Constants.NOT_FOUND_CODE).json({ error: req.t('NO_DATA') });
        }
    };
}
