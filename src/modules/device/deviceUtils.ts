import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable } from '../../config/tables';

export class DeviceUtils {
   // Get User devices
   
  public async addDevice(deviceDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.DEVICE, deviceDetails);
    return ResponseBuilder.data({ id: newDevice.insertId });
  }

}
