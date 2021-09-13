import * as express from 'express';
import { Constants } from './config/constants';

import { AuthRoute } from './modules/auth/authRoute';
import { CMSRoute } from './modules/cms/cmsRoute';
import { DeviceRoute } from './modules/device/deviceRoute';
import { ProjectRoute } from './modules/project/projectRoute';
import { MergeRoute } from './modules/merge/mergeRoute';
import { TaskRoute } from './modules/task/taskRoute';
import { CategoryRoute } from './modules/category/categoryRoute';
import { StoreRoute } from './modules/store/storeRoute';
import { AnalyticRoute } from './modules/analytic/analyticRoute';
import { ReviewRoute } from './modules/review/reviewRoute';

export class Routes {
  protected basePath: string;

  constructor(NODE_ENV: string) {
    switch (NODE_ENV) {
      case 'production':
        this.basePath = '/app/dist';
        break;
      case 'development':
        this.basePath = '/app/public';
        break;
    }
  }

  public defaultRoute(req: express.Request, res: express.Response) {
    res.json({
      message: 'Hello !',
    });
  }

  public path() {
    const router = express.Router();

    router.use('/auth', AuthRoute);
    router.use('/projects', ProjectRoute);
    router.use('/merge', MergeRoute);
    router.use('/task', TaskRoute);
    router.use('/cms', CMSRoute);
    router.use('/devices', DeviceRoute);
    router.use('/categories', CategoryRoute);
    router.use('/store', StoreRoute);
    router.use('/analytics', AnalyticRoute);
    router.use('/review', ReviewRoute);


    router.all('/*', (req: any, res: any) => {
      return res.status(Constants.NOT_FOUND_CODE).json({
        error: req.t('ERR_URL_NOT_FOUND'),
      });
    });
    return router;
  }
}
