import * as eligibilityCriteria from './eligibilityCriteria.json';
import { AutomationUtils } from './automationUtils';

import { Constants } from '../../config/constants';
import { Request, Response } from 'express';

export class AutomationMiddleware {

    private automationUtils: AutomationUtils = new AutomationUtils();

    public isOrganisationEligible =  async (req: any, res: Response, next: () => void) => {
        const organisationId = req.body._authentication.organization;
        if (eligibilityCriteria.automation.isAllOrganisationEligible || organisationId in eligibilityCriteria.automation.eligibleOrganisation) {
            if (await this.automationUtils.isOrgExist(organisationId)) {
                next();
                return;
            }
        }
        res.status(Constants.FAIL_CODE).json({ code: Constants.FAIL_CODE, message: req.t('ORG_NOT_ELIGIBLE') });
        return;
    };
}