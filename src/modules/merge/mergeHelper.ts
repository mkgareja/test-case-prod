import * as mysql from 'jm-ez-mysql';
import * as moment from 'moment';
import { Tables, SubTaskTable, ProjectTable, TaskTable, TaskResultTable, SubtaskResultsTable, TestMergeTable } from '../../config/tables';
import { ProjectUtils } from '../project/projectUtils';
import { v4 as uuidv4 } from 'uuid';


export class MergeHelper {

    private projectUtils: ProjectUtils = new ProjectUtils();

    public async getMergeResult(result: any) {
        if (!result || result.length <= 0) return result; 
        let projectIdListUnmerged = [];
        let successfulMergeIdList = [];
        result.forEach(r => {
            if (r.status === 1 || r.status === 2) {
                successfulMergeIdList.push(r.mergeId);
            } else {
                projectIdListUnmerged.push(r.source_pid, r.destination_pid);
            }
        });
        const uniqueProjectIdsUnmerged = [...new Set(projectIdListUnmerged)];
        let taskSubtaskUnmergedData;
        let taskSubtaskMergedData;
        if (projectIdListUnmerged.length > 0) taskSubtaskUnmergedData = await this.getTaskSubtaskUnmergedData(uniqueProjectIdsUnmerged);
        if (successfulMergeIdList.length > 0) taskSubtaskMergedData = await this.getMergedSuccessfulData(successfulMergeIdList);
        result.forEach(resultItem => {
            let mergedData = [];
            if (resultItem.status === 1 || resultItem.status === 2) {
                if (taskSubtaskMergedData[resultItem.mergeId]) {
                    mergedData.push(taskSubtaskMergedData[resultItem.mergeId]);
                }
            } else {
                if (taskSubtaskUnmergedData[resultItem.source_pid]) {
                    mergedData.push(taskSubtaskUnmergedData[resultItem.source_pid]);
                }
                if (taskSubtaskUnmergedData[resultItem.destination_pid]) {
                    mergedData.push(taskSubtaskUnmergedData[resultItem.destination_pid]);
                }
            }
            resultItem['merged_data'] = mergedData[0];
        });
        return result;
    }

    public async getTaskSubtaskUnmergedData(uniqueProjectIds: any[]) {
        const result = await mysql.findAll(
            `${Tables.PROJECT} p INNER JOIN ${Tables.TASKS} t on t.${TaskTable.PID}=p.${ProjectTable.ID}
            LEFT JOIN ${Tables.SUBTASKS} as st on t.${TaskTable.ID}=st.${SubTaskTable.TID}`,
            [
                `p.${ProjectTable.ID} as projectId, IFNULL(st.${SubTaskTable.FIELD}, p.${ProjectTable.FIELD}) as field, t.${TaskTable.TITLE} as taskTitle, t.${TaskTable.ID} as taskId,
              st.${SubTaskTable.ID} as subtaskId, st.${SubTaskTable.SUB_ID}, st.${SubTaskTable.OS}, st.${SubTaskTable.TITLE} as subTaskTitle, 
              st.${SubTaskTable.BROWSER}, st.${SubTaskTable.SUMMARY}, st.${SubTaskTable.TESTING}, st.${SubTaskTable.USERNAME}, st.${SubTaskTable.DESC}`
            ],
            `t.${TaskTable.IS_DELETE} = 0 AND t.${TaskTable.IS_ENABLE} = 1 AND t.${TaskTable.PID} in (?) AND st.${SubTaskTable.IS_ENABLE} = 1
              AND st.${SubTaskTable.IS_DELETE} = 0 ORDER BY t.${SubTaskTable.CREATED_AT} DESC`, [uniqueProjectIds]
        );
        let projectIdObj = {};
        uniqueProjectIds.forEach(x => projectIdObj[x] = []);
        result.forEach(item => {
            item.field = JSON.parse(item.field);
            projectIdObj[item.projectId].push(item);
        });
        for (const projectItem in projectIdObj) {
            const res = projectIdObj[projectItem];
            const hash = res.reduce((p, c) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c], p), {});
            const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, id: hash[k][0].taskId, lists: hash[k] }));
            projectIdObj[projectItem] = taskGroupedBy;
        }
        return projectIdObj;
    }

    public async getMergedSuccessfulData(uniqueMergeIds: any[]) {
        const result = await mysql.findAll(
            `${Tables.SUBTASKRESULTS} sr
            LEFT JOIN ${Tables.TASKRESULT} t on t.${TaskResultTable.TID}=sr.${SubtaskResultsTable.TID}
            LEFT JOIN ${Tables.PROJECT} as p on p.${ProjectTable.ID}=sr.${SubtaskResultsTable.PID}`,
            [
              `sr.${SubtaskResultsTable.RID} as merge_id, IFNULL(sr.${SubtaskResultsTable.FIELD}, p.${ProjectTable.FIELD}) as field, ANY_VALUE(t.${TaskResultTable.TITLE}) as taskTitle, t.${TaskResultTable.TID} as taskId,
              sr.${SubtaskResultsTable.SID} as subtaskId, sr.${SubtaskResultsTable.SUB_ID}, sr.${SubtaskResultsTable.OS}, sr.${SubtaskResultsTable.TITLE} as subTaskTitle, 
              sr.${SubtaskResultsTable.BROWSER}, sr.${SubtaskResultsTable.SUMMARY}, sr.${SubtaskResultsTable.TESTING}, sr.${SubtaskResultsTable.USERNAME}, sr.${SubtaskResultsTable.DESC}, 
              sr.${SubtaskResultsTable.ID} as subtaskResultId, sr.${SubtaskResultsTable.TESTSTATUS}`
            ],
            `sr.${SubtaskResultsTable.RID} in (?) GROUP BY sr.${SubtaskResultsTable.ID} ORDER BY sr.${SubtaskResultsTable.CREATED_AT} DESC`, [uniqueMergeIds]
        );
        let projectIdObj = {};
        uniqueMergeIds.forEach(x => projectIdObj[x] = []);
        result.forEach(item => {
            item.field = JSON.parse(item.field);
            projectIdObj[item.merge_id].push(item);
        });
        for (const projectItem in projectIdObj) {
            const res = projectIdObj[projectItem];
            const hash = res.reduce((p, c) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c], p), {});
            const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, id: hash[k][0].taskId, lists: hash[k] }));
            projectIdObj[projectItem] = taskGroupedBy;
        }
        return projectIdObj;
    }

    public async copyTaskSubtaskResult(mergeData: any) {
        const mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        const taskReplicateQuery = `INSERT INTO ${Tables.TASKRESULT}(taskid, projectid, resultid, status, modelId, data, title, createdAt) 
        SELECT id, '${mergeData[0].destination_pid}', '${mergeData[0].id}', status, modelId, data, title, '${mysqlTimestamp}' FROM tasks where isEnable = 1 and isDelete = 0 and projectid = ?`;
        await mysql.query(taskReplicateQuery, [mergeData[0].source_pid]);

        const subtaskReplicateQuery = `INSERT INTO ${Tables.SUBTASKRESULTS}(subtaskid, projectid, taskid, resultid, title, description, subid, summary, browser, os, testing, username, field, createdAt) 
        SELECT id, '${mergeData[0].destination_pid}', taskid, '${mergeData[0].id}', title, description, subid, summary, browser, os, testing, username, field, '${mysqlTimestamp}' from subtasks where isEnable = 1 and isDelete = 0 and projectid = ?`;
        await mysql.query(subtaskReplicateQuery, [mergeData[0].source_pid]);
        return;
    }

    public async copyTaskSubtasks(mergeData: any) {
        const mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        const taskSubtasks = await this.projectUtils.getTask(mergeData[0].source_pid, 0, 1844674407370955161);
        const taskSubtasksData = taskSubtasks.data;
        for (const taskObj in taskSubtasksData) {
            taskSubtasksData[taskObj].uuid = uuidv4();
        }
        const taskInsertData = taskSubtasksData.map(item => [item.uuid, mergeData[0].destination_pid, 0, null, null, item.taskTitle]);
        const taskReplicateQuery = `INSERT INTO ${Tables.TASKS} (id, projectid, status, modelId, data, title) VALUES ?`;
        await mysql.query(taskReplicateQuery, [taskInsertData]);

        const subtaskInsertData = [];
        for (const taskItem in taskSubtasksData) {
            const taskItemVal = taskSubtasksData[taskItem];
            if (taskItemVal.lists.length > 0) {
                for (const subtaskItem in taskItemVal.lists) {
                    const subtaskItemVal = taskItemVal.lists[subtaskItem];
                    const temp = [uuidv4(), mergeData[0].destination_pid, taskItemVal.uuid, subtaskItemVal.subTaskTitle, subtaskItemVal.description, 
                                  subtaskItemVal.subid, subtaskItemVal.summary, subtaskItemVal.browser, subtaskItemVal.os, subtaskItemVal.testing, 
                                  subtaskItemVal.username, JSON.stringify(subtaskItemVal.field)];
                    subtaskInsertData.push(temp);
                }
            }
        }
        const subtaskReplicateQuery = `INSERT INTO ${Tables.SUBTASKS}(id, projectid, taskid, title, description, 
            subid, summary, browser, os, testing, username, field) VALUES ?`;
        await mysql.query(subtaskReplicateQuery, [subtaskInsertData]);
        return;
    }
}