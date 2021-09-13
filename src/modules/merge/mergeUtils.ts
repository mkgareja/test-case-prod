import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { SendEmail } from '../../helpers/sendEmail';
import { Tables,TestMergeTable ,UserTable, OrgEmailsTable, StaticContentTable, ProjectTable, TestrunsTable, projectUsersTable, OrganizationUsersTable, OrganizationTable } from '../../config/tables';

export class MergeUtils {
  public async getMerge(id) {
    const result = await mysql.findAll(
      `${Tables.MERGE} m
      LEFT JOIN ${Tables.USER} as u on m.${TestMergeTable.USERID}=u.${UserTable.ID}
      LEFT JOIN ${Tables.USER} as cu on m.${TestMergeTable.CHANGEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.PROJECT} as ps on m.${TestMergeTable.SOURCE_PID}=ps.${ProjectTable.ID}
      LEFT JOIN ${Tables.PROJECT} as pd on m.${TestMergeTable.DESTINATION_PID}=pd.${ProjectTable.ID}`,
      [`m.${TestMergeTable.ID}`,
      `m.${TestMergeTable.CREATED_AT}`,
      `m.${TestMergeTable.DESTINATION_PID}`,
      `m.${TestMergeTable.MERGED_DATA}`,
      `m.${TestMergeTable.MERGE_NO}`,
      `m.${TestMergeTable.ORGID}`,
      `m.${TestMergeTable.SOURCE_PID}`,
      `m.${TestMergeTable.STATUS}`,
      `m.${TestMergeTable.USERID}`,
      `u.${UserTable.FIRSTNAME} as createdByFirstname`,
      `cu.${UserTable.FIRSTNAME} as changedByFirstname`,
      `ps.${ProjectTable.NAME} as sourceProjectName`,
      `pd.${ProjectTable.NAME} as destinamtionProjectName`],`m.${TestMergeTable.IS_DELETE} = 0 AND m.${TestMergeTable.IS_ENABLE} = 1 and m.${TestMergeTable.ORGID} = ?`,[id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }
  public async getMergeById(id) {
    const result = await mysql.findAll(
      `${Tables.MERGE} m
      LEFT JOIN ${Tables.USER} as u on m.${TestMergeTable.USERID}=u.${UserTable.ID}
      LEFT JOIN ${Tables.USER} as cu on m.${TestMergeTable.CHANGEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.PROJECT} as ps on m.${TestMergeTable.SOURCE_PID}=ps.${ProjectTable.ID}
      LEFT JOIN ${Tables.PROJECT} as pd on m.${TestMergeTable.DESTINATION_PID}=pd.${ProjectTable.ID}`,
      [`m.${TestMergeTable.ID}`,
      `m.${TestMergeTable.CREATED_AT}`,
      `m.${TestMergeTable.DESTINATION_PID}`,
      `m.${TestMergeTable.MERGED_DATA}`,
      `m.${TestMergeTable.MERGE_NO}`,
      `m.${TestMergeTable.ORGID}`,
      `m.${TestMergeTable.SOURCE_PID}`,
      `m.${TestMergeTable.STATUS}`,
      `m.${TestMergeTable.USERID}`,
      `u.${UserTable.FIRSTNAME} as createdByFirstname`,
      `cu.${UserTable.FIRSTNAME} as changedByFirstname`,
      `ps.${ProjectTable.NAME} as sourceProjectName`,
      `pd.${ProjectTable.NAME} as destinamtionProjectName`],`m.${TestMergeTable.IS_DELETE} = 0 AND m.${TestMergeTable.IS_ENABLE} = 1 and m.${TestMergeTable.ID} = ?`,[id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }
  public async addMerge(mergeDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.MERGE, mergeDetails);
    return ResponseBuilder.data({ newDevice:newDevice });
  }
  public async updateMerge(Info,id): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.MERGE, Info, `${TestMergeTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
}
