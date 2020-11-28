import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable,TaskTable,SubTaskTable } from '../../config/tables';

export class TaskUtils {
   // Get User devices
   
  public async addTask(Details: Json): Promise<ResponseBuilder> {
    const res = await mysql.insert(Tables.TASKS, Details);
    return ResponseBuilder.data({ res:res });
  }
  public async addSubTask(Details: Json): Promise<ResponseBuilder> {
    const res = await mysql.insert(Tables.SUBTASKS, Details);
    return ResponseBuilder.data({ res:res });
  }

  public async updateTask(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.TASKS, Info, `${TaskTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {  
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async updateSubTask(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.SUBTASKS, Info, `${SubTaskTable.ID} = ?`, [id])
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async getTasks(id) {
    const result = await mysql.findAll(Tables.TASKS,
      [TaskTable.ID,
        TaskTable.TITLE,
        TaskTable.CREATED_AT,
        TaskTable.DESC], `${TaskTable.IS_DELETE} = 0 AND ${TaskTable.IS_ENABLE} = 1 and ${TaskTable.PID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async getSubTasks(id) {
    const result = await mysql.findAll(Tables.SUBTASKS,
      [SubTaskTable.ID,
        SubTaskTable.TITLE,
        SubTaskTable.CREATED_AT,
        SubTaskTable.TID,
        SubTaskTable.DESC], `${SubTaskTable.IS_DELETE} = 0 AND ${SubTaskTable.IS_ENABLE} = 1 and ${SubTaskTable.PID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }

}
