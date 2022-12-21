import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { Tables, ResultTable, SubtaskResultsTable, SubTaskTable }from '../../config/tables';
import { v4 as uuidv4 } from 'uuid';

export class ResultUtils {
    public async addResult(tempObj: Json) {
        await this.deleteProjectResult(tempObj.project_id);
        await mysql.insert(Tables.RESULT, tempObj);
    }

    public async deleteProjectResult(projectId: any): Promise<ResponseBuilder> {
        const Info = {
            is_active: 0
        }
        const result = await mysql.update(Tables.RESULT, Info, `${ResultTable.PID} = ?`, [projectId]);
        return ResponseBuilder.data({ res:result, status : true });
    }

    public async updateSubtaskResult(id: any, Info: { testStatus: any; }): Promise<ResponseBuilder> {
        const result = await mysql.updateFirst(Tables.SUBTASKRESULTS, Info, `${SubtaskResultsTable.ID} = ?`, [id]);
        if (result.affectedRows > 0) {  
          return ResponseBuilder.data({ status: true, res: result });
        } else {
          return ResponseBuilder.data({ status: false });
        }
    }

    public async updateSubtaskResultBySubtaskAndResult(sid: any, rid: any, Info: { testStatus: any; }): Promise<ResponseBuilder> {
        const sql = `UPDATE subtaskResult SET testStatus = 'fail' WHERE subtaskid = '${sid}' AND resultid = '${rid}' LIMIT 1`
        const result = await mysql.query(sql);
        if (result.affectedRows > 0) {  
            return ResponseBuilder.data({ status: true, res: result });
        } else {
            return ResponseBuilder.data({ status: false });
        }
    }

    public async getSubtaskResultId(sid: any) {
        const resultid = await mysql.first(
            `${Tables.RESULT} r LEFT JOIN ${Tables.SUBTASKS} st ON r.${ResultTable.PID} = st.${SubTaskTable.PID}`,
            [`r.${ResultTable.ID}`],
            `st.${SubTaskTable.ID} = ? AND r.${ResultTable.IS_ACTIVE} = 1 AND r.${ResultTable.IS_DELETE} = 0`,
            [sid]
        );
        return resultid.id;
    }

    public async updateAllSubtaskStatus(taskId, Info): Promise<ResponseBuilder> {
        const result = await mysql.update(Tables.SUBTASKRESULTS, Info, `${SubtaskResultsTable.TID} = ?`, [taskId]);
        if (result.affectedRows > 0) {
          return ResponseBuilder.data({ status: true, data: result });
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

    public async addResultAndSubtaskResult(tempObj: Json): Promise<ResponseBuilder>  {
        await this.addResult(tempObj);
        await this.addTaskResult(tempObj.project_id, tempObj.id);
        await this.addSubtaskResult(tempObj.project_id, tempObj.id);
        return ResponseBuilder.data({ status : true });
    }

    public async getSubtaskResultStatusCount(projectId: any) {
        const query = `SELECT sr.${SubtaskResultsTable.TESTSTATUS}, COUNT(sr.${SubtaskResultsTable.TESTSTATUS}) as count FROM subtaskResult sr
        LEFT JOIN result r on r.${ResultTable.ID} = sr.${SubtaskResultsTable.RID} 
        WHERE r.${ResultTable.IS_ACTIVE} = 1 AND r.${ResultTable.IS_DELETE} = 0 AND r.${ResultTable.PID} = ?
        GROUP BY sr.${SubtaskResultsTable.TESTSTATUS}`;
        const result = await mysql.query(query, [projectId]);
        let res = {};
        result.forEach((x: { testStatus: string | number; count: any; }) => {
            res[x.testStatus] = x.count;
        })
        return res;
    }

    public async getStatusCountByResultId(resultId: any) {
        const query = `SELECT sr.${SubtaskResultsTable.TESTSTATUS}, COUNT(sr.${SubtaskResultsTable.TESTSTATUS}) as count FROM subtaskResult sr
        WHERE sr.${SubtaskResultsTable.RID} = ? GROUP BY sr.${SubtaskResultsTable.TESTSTATUS}`
        const result = await mysql.query(query, [resultId]);
        let res = {};
        result.forEach((x: { testStatus: string | number; count: any; }) => {
            res[x.testStatus] = x.count;
        })
        return res;
    }
}
