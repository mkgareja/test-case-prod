import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, ResultTable, SubtaskResultsTable, SubTaskTable }from '../../config/tables';
import { v4 as uuidv4 } from 'uuid';

export class ResultUtils {
    public async addResult(projectId): Promise<ResponseBuilder> {
        const resultObj = {
            id: uuidv4(),
            project_id: projectId,
            is_active: 1
        }
        const deleteResult = await this.deleteProjectResult(projectId);
        const res = await mysql.insert(Tables.RESULT, resultObj);
        return ResponseBuilder.data({ res:res, status : true });
    }

    public async deleteProjectResult(projectId: any): Promise<ResponseBuilder> {
        const Info = {
            is_active: 0
        }
        const result = await mysql.update(Tables.RESULT, Info, `${ResultTable.PID} = ?`, [projectId]);
        return ResponseBuilder.data({ res:result, status : true });
    }

    public async addSubtaskResult(infoObj, uuid): Promise<ResponseBuilder> {
        const resultId = await this.getResultId(infoObj.projectid);
        const resultObj = {
            id: uuidv4(),
            result_id: resultId,
            project_id: infoObj.projectid,
            task_id: infoObj.taskid,
            subtask_id: uuid
        }
        const res = await mysql.insert(Tables.SUBTASKRESULTS, resultObj);
        return ResponseBuilder.data({ res:res, status : true });
    }

    private async getResultId(id: any) {
        const result = await mysql.first(Tables.RESULT,
            [ResultTable.ID], `${ResultTable.IS_DELETE} = 0 AND ${ResultTable.IS_ACTIVE} = 1 and ${ResultTable.PID} = ?`, [id]);
        return result.id;
    }

    public async updateSubtaskResult(id, Info): Promise<ResponseBuilder> {
        const result = await mysql.updateFirst(Tables.SUBTASKRESULTS, Info, `${SubtaskResultsTable.ID} = ?`, [id]);
        if (result.affectedRows > 0) {  
          return ResponseBuilder.data({ status: true, res: result });
        } else {
          return ResponseBuilder.data({ status: false });
        }
    }

    public async bulkAddSubtaskResult(projectId): Promise<ResponseBuilder> {
        const resultId = await this.getResultId(projectId);
        const result = await mysql.findAll(Tables.SUBTASKS,
            [SubTaskTable.ID, SubTaskTable.TID], `${SubTaskTable.IS_DELETE} = 0 AND ${SubTaskTable.IS_ENABLE} = 1 and ${SubTaskTable.PID} = ?`, [projectId]);
        const subTaskResultObj = [];
        result.forEach(r => {
            subTaskResultObj.push({
                id: uuidv4(),
                result_id: resultId,
                project_id: projectId,
                task_id: r.taskid
            })
        });
        const res = await mysql.insertMany(Tables.SUBTASKRESULTS, subTaskResultObj);
        return ResponseBuilder.data({ res:res, status : true });
    }

    public async addResultAndSubtaskResult(projectId: any) {
        await this.addResult(projectId);
        await this.bulkAddSubtaskResult(projectId);
    }
}