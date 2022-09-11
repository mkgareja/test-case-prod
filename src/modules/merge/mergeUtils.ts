import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { MergeHelper } from './mergeHelper';
import { SendEmail } from '../../helpers/sendEmail';
import { Tables,TestMergeTable ,UserTable, ProjectTable } from '../../config/tables';

export class MergeUtils {
  private mergeHelper: MergeHelper = new MergeHelper();


  public async getMergeByProjectId(id: any) {
    const result = await mysql.findAll(
      `${Tables.MERGE} m
      LEFT JOIN ${Tables.USER} as u on m.${TestMergeTable.USERID}=u.${UserTable.ID}
      LEFT JOIN ${Tables.USER} as cu on m.${TestMergeTable.CHANGEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.PROJECT} as ps on m.${TestMergeTable.SOURCE_PID}=ps.${ProjectTable.ID}
      LEFT JOIN ${Tables.PROJECT} as pd on m.${TestMergeTable.DESTINATION_PID}=pd.${ProjectTable.ID}`,
      [`m.${TestMergeTable.ID} as mergeId`,
      `m.${TestMergeTable.MERGE_NO}`,
      `m.${TestMergeTable.SOURCE_PID}`,
      `m.${TestMergeTable.DESTINATION_PID}`,
      `m.${TestMergeTable.CREATED_AT}`,
      `m.${TestMergeTable.STATUS}`,
      `m.${TestMergeTable.USERID}`,
      `m.${TestMergeTable.ORGID}`,
      `u.${UserTable.FIRSTNAME} as createdByFirstname`,
      `cu.${UserTable.FIRSTNAME} as changedByFirstname`,
      `ps.${ProjectTable.NAME} as sourceProjectName`,
      `pd.${ProjectTable.NAME} as destinationProjectName`],`m.${TestMergeTable.IS_DELETE} = 0 AND m.${TestMergeTable.IS_ENABLE} = 1 and pd.${ProjectTable.ID} = ?`,[id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }

  public async getMergeById(id: any) {
    const result = await mysql.findAll(
      `${Tables.MERGE} m
      LEFT JOIN ${Tables.USER} as u on m.${TestMergeTable.USERID}=u.${UserTable.ID}
      LEFT JOIN ${Tables.USER} as cu on m.${TestMergeTable.CHANGEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.PROJECT} as ps on m.${TestMergeTable.SOURCE_PID}=ps.${ProjectTable.ID}
      LEFT JOIN ${Tables.PROJECT} as pd on m.${TestMergeTable.DESTINATION_PID}=pd.${ProjectTable.ID}`,
      [`m.${TestMergeTable.ID} as mergeId`,
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

  public async updateMerge(Info: { status: any; isDelete?: any; }, id: any): Promise<ResponseBuilder> {
    const result = await mysql.updateFirst(Tables.MERGE, Info, `${TestMergeTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      const mergeData = await this.getMergeById(id);
      if (Info.status === 1) {
        await this.mergeHelper.copyTaskSubtask(mergeData);
      }
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }

  public async isMergeAlreadyExist(source_pid: String, destination_pid: String): Promise<Boolean> {
    const result = await mysql.first(Tables.MERGE, [TestMergeTable.ID], 
      `${TestMergeTable.SOURCE_PID} = ? and ${TestMergeTable.DESTINATION_PID} = ? and ${TestMergeTable.STATUS} = 0`, 
      [source_pid, destination_pid]);
    if (result) {
      return true;
    }
    return false;
  }
}
