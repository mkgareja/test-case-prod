import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { MergeHelper } from './mergeHelper';
import { SendEmail } from '../../helpers/sendEmail';
import { Tables,TestMergeTable ,UserTable, ProjectTable } from '../../config/tables';

export class MergeUtils {
  private mergeHelper: MergeHelper = new MergeHelper();

  public async getMergeByOrgId(id) {
    const result = await mysql.findAll(
      `${Tables.MERGE} m
      LEFT JOIN ${Tables.USER} as u on m.${TestMergeTable.USERID}=u.${UserTable.ID}
      LEFT JOIN ${Tables.USER} as cu on m.${TestMergeTable.CHANGEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.PROJECT} as ps on m.${TestMergeTable.SOURCE_PID}=ps.${ProjectTable.ID}
      LEFT JOIN ${Tables.PROJECT} as pd on m.${TestMergeTable.DESTINATION_PID}=pd.${ProjectTable.ID}`,
      [`m.${TestMergeTable.ID}`,
      `m.${TestMergeTable.CREATED_AT}`,
      `m.${TestMergeTable.DESTINATION_PID}`,
      `m.${TestMergeTable.MERGE_NO}`,
      `m.${TestMergeTable.ORGID}`,
      `m.${TestMergeTable.SOURCE_PID}`,
      `m.${TestMergeTable.STATUS}`,
      `m.${TestMergeTable.USERID}`,
      `u.${UserTable.FIRSTNAME} as createdByFirstname`,
      `cu.${UserTable.FIRSTNAME} as changedByFirstname`,
      `ps.${ProjectTable.NAME} as sourceProjectName`,
      `pd.${ProjectTable.NAME} as destinamtionProjectName`],`m.${TestMergeTable.IS_DELETE} = 0 AND m.${TestMergeTable.IS_ENABLE} = 1 and m.${TestMergeTable.ORGID} = ?`,[id]);
    const getMergeResult = await this.mergeHelper.getMergeResult(result);
    if (getMergeResult.length >= 0) {
      return getMergeResult;
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
      `m.${TestMergeTable.MERGE_NO}`,
      `m.${TestMergeTable.ORGID}`,
      `m.${TestMergeTable.SOURCE_PID}`,
      `m.${TestMergeTable.STATUS}`,
      `m.${TestMergeTable.USERID}`,
      `u.${UserTable.FIRSTNAME} as createdByFirstname`,
      `cu.${UserTable.FIRSTNAME} as changedByFirstname`,
      `ps.${ProjectTable.NAME} as sourceProjectName`,
      `pd.${ProjectTable.NAME} as destinamtionProjectName`],`m.${TestMergeTable.IS_DELETE} = 0 AND m.${TestMergeTable.IS_ENABLE} = 1 and m.${TestMergeTable.ID} = ?`,[id]);
    const getMergeData = await this.mergeHelper.getMergeResult(result);
    if (getMergeData.length > 0) {
      return getMergeData;
    } else {
      return false;
    }
  }
  public async addMerge(mergeDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.MERGE, mergeDetails);
    return ResponseBuilder.data({ newDevice:newDevice });
  }
  public async updateMerge(Info,id): Promise<ResponseBuilder> {
    const result = await mysql.updateFirst(Tables.MERGE, Info, `${TestMergeTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      const mergeData = await this.getMergeById(id);
      await this.mergeHelper.copyTaskSubtask(mergeData);
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
}
