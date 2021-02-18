import { ReviewUtils } from './reviewUtils';
import { Constants } from '../../config/constants';

export class ReviewMiddleware {
  private reviewUtils: ReviewUtils = new ReviewUtils();
  public checkReviewExist = async (req: any, res: any, next: () => void) => {
    const isActive = await this.reviewUtils.checkReviewExist(req._user.uid, req.query.sid, false, true);
    if(isActive.result.status){
        const isReview = await this.reviewUtils.checkReviewExist(req._user.uid, req.query.sid, false, false);
            if (isReview.result.status) {
              res.status(Constants.FAIL_CODE).json({ msg: req.t('REVIEW_EXIST'), code: Constants.SUCCESS_CODE });
            }else{
              next();
            }
    }else{
      res.status(Constants.FORBIDDEN_CODE).json({ msg: req.t('STORE_NOT_ACTIVE'), code: Constants.SUCCESS_CODE });
    }
  }
}