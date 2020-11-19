import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable } from '../../config/tables';

export class AnalyticUtils {
  public async addTime(timeDetails: Json): Promise<ResponseBuilder> {
    const time = await mysql.insert(Tables.LOGININFO, timeDetails);
    return ResponseBuilder.data({ id: time.insertId });
  }

  public async addPageCount(pageDetails: Json): Promise<ResponseBuilder> {
    const time = await mysql.insert(Tables.PAGEVISITCOUNT, pageDetails);
    return ResponseBuilder.data({ id: time.insertId });
  }
  public async addSearchKeyCount(keyDetails: Json): Promise<ResponseBuilder> {
    const time = await mysql.insert(Tables.SEARCHKEYCOUNT, keyDetails);
    return ResponseBuilder.data({ id: time.insertId });
  }
}
