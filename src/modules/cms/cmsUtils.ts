import * as mysql from 'jm-ez-mysql';
import { Tables, UserTable, DeviceTable,StaticContentTable } from '../../config/tables';

export class CMSUtils {
   // Get User devices
   public async getStaticPage(name: string) {
    return await mysql.first(Tables.STATIC_CONTENT, [StaticContentTable.NAME,StaticContentTable.CONTENT], `${StaticContentTable.NAME} = ?`, [name]);
  }

}
