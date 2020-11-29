import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable,ProjectTable } from '../../config/tables';

export class ProjectUtils {
   // Get User devices
   
  public async addProject(projectDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.PROJECT, projectDetails);
    return ResponseBuilder.data({ newDevice:newDevice });
  }

  public async updateProject(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.PROJECT, Info, `${ProjectTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async getProjects(id) {
    const result = await mysql.findAll(Tables.PROJECT,
      [ProjectTable.ID,
        ProjectTable.NAME,
        ProjectTable.TYPE,
        ProjectTable.DESC,
        ProjectTable.CREATED_AT], `${ProjectTable.IS_DELETE} = 0 AND ${ProjectTable.IS_ENABLE} = 1 and ${ProjectTable.USERID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async getTask(id) {
    const result = await mysql.findAll(Tables.PROJECT,
      [ProjectTable.DATA], `${ProjectTable.IS_DELETE} = 0 AND ${ProjectTable.IS_ENABLE} = 1 and ${ProjectTable.ID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }

}
