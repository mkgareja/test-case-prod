import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable,ProjectTable,TestrunsTable, projectUsersTable } from '../../config/tables';

export class ProjectUtils {
   // Get User devices
   
  public async addProject(projectDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.PROJECT, projectDetails);
    return ResponseBuilder.data({ newDevice:newDevice });
  }
  public async addProjectUsers(projectDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.PROJECTUSERS, projectDetails);
    return ResponseBuilder.data({ newDevice:newDevice });
  }
  public async addTestRun(tempObj: Json): Promise<ResponseBuilder> {
    const data = await mysql.insert(Tables.TESTRUNS, tempObj);
    return ResponseBuilder.data({ data:data });
  }
  public async updateTestRun(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.TESTRUNS, Info, `${ProjectTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
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
    const result =  await mysql.findAll(`${Tables.PROJECT} p
        LEFT JOIN ${Tables.PROJECTUSERS} pu on p.${ProjectTable.ID} = pu.${projectUsersTable.PROJECTID}`,[
        `p.${ProjectTable.ID}`,
        `p.${ProjectTable.NAME}`,
        `p.${ProjectTable.TYPE}`,
        `p.${ProjectTable.DESC}`,
        `p.${ProjectTable.CREATED_AT}`
        ],
        `p.${ProjectTable.IS_DELETE} = 0 AND p.${ProjectTable.IS_ENABLE} = 1 AND  pu.${projectUsersTable.USERID} = ? GROUP BY p.${ProjectTable.ID} ORDER BY p.${ProjectTable.CREATED_AT} DESC`,
        [id]);

    // const result = await mysql.findAll(Tables.PROJECT,
    //   [ProjectTable.ID,
    //     ProjectTable.NAME,
    //     ProjectTable.TYPE,
    //     ProjectTable.DESC,
    //     ProjectTable.CREATED_AT], `${ProjectTable.IS_DELETE} = 0 AND ${ProjectTable.IS_ENABLE} = 1 and ${ProjectTable.USERID} = ?`, [id]);
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
  public async checkUserProjectExists(uid,pid) {
    return await mysql.first(
      Tables.PROJECTUSERS,
      [
        projectUsersTable.ID
      ],
      `${projectUsersTable.USERID} = ?
      AND ${projectUsersTable.PROJECTID} = ?
      AND ${projectUsersTable.IS_ENABLE} = 1
      AND ${projectUsersTable.IS_DELETE} = 0`,
      [uid,pid]
    )
  }
  public async getTestRun(id) {
    const result = await mysql.findAll(Tables.TESTRUNS,
      [TestrunsTable.DATA,TestrunsTable.DESCRIPTION,TestrunsTable.CREATED_AT,TestrunsTable.NAME], `${TestrunsTable.IS_DELETE} = 0 AND ${TestrunsTable.IS_ENABLE} = 1 and ${TestrunsTable.ID} = ? ORDER BY ${TestrunsTable.CREATED_AT} DESC`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async getTestRuns(id) {
    const result = await mysql.findAll(Tables.TESTRUNS,
      [TestrunsTable.ID,TestrunsTable.DESCRIPTION,TestrunsTable.CREATED_AT,TestrunsTable.NAME], `${TestrunsTable.IS_DELETE} = 0 AND ${TestrunsTable.IS_ENABLE} = 1 and ${TestrunsTable.PROJECTID} = ? ORDER BY ${TestrunsTable.CREATED_AT} DESC`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }

}
