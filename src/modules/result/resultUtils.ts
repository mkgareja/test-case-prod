import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, ResultTable, SubtaskResultsTable, SubTaskTable }from '../../config/tables';
import { v4 as uuidv4 } from 'uuid';

export class ResultUtils {
    public async addResult(projectId) {
        const resultId = uuidv4();
        const resultObj = {
            id: resultId,
            project_id: projectId,
            is_active: 1
        }
        await this.deleteProjectResult(projectId);
        await mysql.insert(Tables.RESULT, resultObj);
        return resultId;
    }

    public async deleteProjectResult(projectId: any): Promise<ResponseBuilder> {
        const Info = {
            is_active: 0
        }
        const result = await mysql.update(Tables.RESULT, Info, `${ResultTable.PID} = ?`, [projectId]);
        return ResponseBuilder.data({ res:result, status : true });
    }

    public async updateSubtaskResult(id, Info): Promise<ResponseBuilder> {
        const result = await mysql.updateFirst(Tables.SUBTASKRESULTS, Info, `${SubtaskResultsTable.ID} = ?`, [id]);
        if (result.affectedRows > 0) {  
          return ResponseBuilder.data({ status: true, res: result });
        } else {
          return ResponseBuilder.data({ status: false });
        }
    }

    private async addTaskResult(projectId: any, resultId: any) {
        const query = `INSERT INTO ${Tables.TASKRESULT}(taskid, projectid, resultid, status, modelId, data, title, createdAt) 
        SELECT id, projectid, '${resultId}', status, modelId, data, title, createdAt FROM tasks where isEnable = 1 and isDelete = 0 and projectid = ?`;
        await mysql.query(query, [projectId]);
    }
    
    private async addSubtaskResult(projectId: any, resultId: any) {
        const query = `INSERT INTO ${Tables.SUBTASKRESULTS}(subtaskid, projectid, taskid, resultid, title, description, subid, summary, browser, os, testing, username, field, createdAt) 
        SELECT id, projectid, taskid, '${resultId}', title, description, subid, summary, browser, os, testing, username, field, createdAt from subtasks where isEnable = 1 and isDelete = 0 and projectid = ?`;
        await mysql.query(query, [projectId]);
    }

    public async addResultAndSubtaskResult(projectId: any) {
        const resultId = await this.addResult(projectId);
        await this.addTaskResult(projectId, resultId);
        await this.addSubtaskResult(projectId, resultId);
    }
}
