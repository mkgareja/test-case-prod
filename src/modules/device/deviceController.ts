import { Constants } from '../../config/constants';
import { Request, Response } from 'express';
import { DeviceUtils } from './deviceUtils';

export class DeviceController {
    private deviceUtils: DeviceUtils = new DeviceUtils();
    public addDevice = async (req: any, res: Response) => {
        const deviceObj = {
            deviceType: req.body.devicetype,
            deviceToken: req.body.deviceId,
            createdAt: new Date()
        }
        // creating user profile
        const result = await this.deviceUtils.addDevice(deviceObj);
        result.msg = req.t('DEVICE_ADDED');
        res.status(Constants.SUCCESS_CODE).json({ data: result });
    };
}
