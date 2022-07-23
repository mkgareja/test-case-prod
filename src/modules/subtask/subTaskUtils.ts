import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, UserTable, DeviceTable,StaticContentTable,TaskTable,SubTaskTable } from '../../config/tables';

export class SubTaskUtils {

    public async addSubTask(Details: Json): Promise<ResponseBuilder> {
        const subtasks = await mysql.findAll(Tables.SUBTASKS, [SubTaskTable.ID], `${SubTaskTable.ID} = ?`, [Details.id]);
        let res;
        if (subtasks.length == 0) {
            res = await mysql.insert(Tables.SUBTASKS, Details);
        } else {
            return await this.updateSubtask(Details.id, Details);
        }
        res.subTaskId = Details.id;
        return ResponseBuilder.data({ res:res, status: true });
    }

    public async updateSubtask(id, Info): Promise<ResponseBuilder> {
        const  result = await mysql.updateFirst(Tables.SUBTASKS, Info, `${SubTaskTable.ID} = ?`, [id]);
        result.subTaskId = id;
        if (result.affectedRows > 0) {  
          return ResponseBuilder.data({ res: result, status: true });
        } else {
          return ResponseBuilder.data({ status: false });
        }
    }

}