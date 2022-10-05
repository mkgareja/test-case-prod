import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { SendEmail } from '../../helpers/sendEmail';
import { TaskUtils } from './../task/taskUtils';
import { v4 as uuidv4 } from 'uuid';

import { Tables, UserTable,OrgEmailsTable,TestMergeTable,ProjectTable,TestrunsTable, projectUsersTable,OrganizationUsersTable, TaskTable, SubTaskTable, ResultTable, SubtaskResultsTable, TaskResultTable } from '../../config/tables';

export class ProjectUtils {
  // Get User devices
  private taskUtils: TaskUtils = new TaskUtils();

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
    return ResponseBuilder.data({ status: true, data:data });
  }
  public async updateUserProject(uid: any,Info: any,pid: any): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.PROJECTUSERS, Info, `${projectUsersTable.USERID} = ? and ${projectUsersTable.PROJECTID} = ?`, [uid,pid]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async removeEmailOrg(Info: { isEnable: number; },id: any): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.ORGEMAIL, Info, `${OrgEmailsTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async deleteUserProject(uid: any,pid: any): Promise<ResponseBuilder> {
    try {
      const  result = await mysql.delete(Tables.PROJECTUSERS, `${projectUsersTable.USERID} = ? and ${projectUsersTable.PROJECTID} = ?`, [uid,pid]);
      if (result.affectedRows > 0) {
        return ResponseBuilder.data({ status: true, data: result });
      } else {
        return ResponseBuilder.data({ status: false });
      }
    } catch (error) {
      console.log(error)
    }

  }
  public async updateResult(id: any,Info: { is_automated: any; userid: any; is_processed: number; }): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.RESULT, Info, `${ResultTable.IS_ACTIVE} = 1 and ${ResultTable.PID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async updateProject(id: any,Info: { name?: any; type?: any; userid?: any; description?: any; data?: string; field?: string; isDelete?: number; }): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.PROJECT, Info, `${ProjectTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }

  public async insertTaskSubtask(dataItem: { [x: string]: any; id: any; model: any; }, projectId: any) {
    const taskId = uuidv4();
    const taskObj = {
      id: taskId,
      projectid: projectId,
      title: dataItem.model
    };
    const taskAddResult = await this.taskUtils.addTask(taskObj);
    let res: { [k: string]: any } = {};
    res.taskId = taskId;
    if (taskAddResult.result.status == true) {
      res.taskStatus = "success";
      const list = dataItem.lists;
      if (list.length > 0) {
        res.subtask = {};
      }
      for (const subTaskItem of list) {
        try {
          const subTaskObj = await this.getSubTaskObj(projectId, taskId, subTaskItem);
          const subtaskAddResult = await this.taskUtils.addSubTask(subTaskObj);
          if (subtaskAddResult.result.status == true) {
            res.subtask.success = res.subtask.success ? res.subtask.success + 1 : 1;
          } else {
            res.subtask.failed = res.subtask.failed ? res.subtask.failed + 1 : 1;
          }
        } catch (error) {
          console.log("Error in adding subtasks: " + error);
          res.subtask.failed = res.subtask.failed  ? res.subtask.failed + 1 : 1;
        }
      };
    } else {
      res.taskStatus = "failed";
    }
    return res;
  }

  private async getSubTaskObj(projectId: any, taskId: any, subTaskItem: any) {
    let infoObj: any = {
        id: uuidv4(),
        projectid: projectId,
        taskid: taskId,
        title: subTaskItem.subTaskTitle,
        subid: subTaskItem.subid,
        description: subTaskItem.description,
        summary: subTaskItem.summary,
        browser: subTaskItem.browser,
        os: subTaskItem.os,
        testing: subTaskItem.testing || 'manual',
        username: subTaskItem.username
    };
    if (subTaskItem.field != undefined && subTaskItem.field.length != 0) {
        infoObj.field = JSON.stringify(subTaskItem.field);
    }
    return infoObj;
}

  public async getProjects(id: any) {
    const result =  await mysql.findAll(`${Tables.PROJECT} p
        LEFT JOIN ${Tables.PROJECTUSERS} pu on p.${ProjectTable.ID} = pu.${projectUsersTable.PROJECTID}
        LEFT JOIN ${Tables.USER} u on u.${UserTable.ID} = pu.${projectUsersTable.USERID}`,[
      `p.${ProjectTable.ID}`,
      `p.${ProjectTable.NAME}`,
      `p.${ProjectTable.TYPE}`,
      `p.${ProjectTable.DESC}`,
      `p.${ProjectTable.CREATED_AT}`,
      `pu.${projectUsersTable.ROLE}`,
      `ROUND((LENGTH(p.${ProjectTable.DATA})- LENGTH(REPLACE(p.${ProjectTable.DATA}, '"id"', "") ))/LENGTH('"id"')) AS testCaseCount`,
      `COUNT(pu.${projectUsersTable.ID}) as totalUser`,
      `(SELECT count(*) FROM ${Tables.MERGE} m where m.${TestMergeTable.DESTINATION_PID} = p.${ProjectTable.ID} AND ${TestMergeTable.STATUS}=0) as totalPendingRequest`,
      `u.${UserTable.FIRSTNAME}`
    ],
      `p.${ProjectTable.IS_DELETE} = 0 AND p.${ProjectTable.IS_ENABLE} = 1 AND  pu.${projectUsersTable.USERID} = ? GROUP BY p.${ProjectTable.ID},pu.${projectUsersTable.ROLE} ORDER BY p.${ProjectTable.CREATED_AT} DESC`,
      [id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }
  public async getProjectsByOrg(id: any) {
    try {
      const result =  await mysql.findAll(`${Tables.PROJECT} p
      LEFT JOIN ${Tables.PROJECTUSERS} pu on p.${ProjectTable.ID} = pu.${projectUsersTable.PROJECTID}
      LEFT JOIN ${Tables.USER} u on u.${UserTable.ID} = pu.${projectUsersTable.USERID}`,[
        `p.${ProjectTable.ID}`,
        `p.${ProjectTable.NAME}`,
        `p.${ProjectTable.TYPE}`,
        `p.${ProjectTable.DESC}`,
        `p.${ProjectTable.CREATED_AT}`,
        `u.${UserTable.FIRSTNAME}`,
        `(SELECT count(*) FROM ${Tables.MERGE} m where m.${TestMergeTable.DESTINATION_PID} = p.${ProjectTable.ID} AND ${TestMergeTable.STATUS}=0) as totalPendingRequest`,
        `ROUND((LENGTH(p.${ProjectTable.DATA})- LENGTH(REPLACE(p.${ProjectTable.DATA}, '"id"', "") ))/LENGTH('"id"')) AS testCaseCount`,
        `COUNT(pu.${projectUsersTable.ID}) as totalUser`,
        `MAX(pu.${projectUsersTable.ROLE}) as role`,
      ],
        `p.${ProjectTable.IS_DELETE} = 0 AND p.${ProjectTable.IS_ENABLE} = 1 AND  pu.${projectUsersTable.ORGID} = ? GROUP BY p.${ProjectTable.ID} ORDER BY p.${ProjectTable.CREATED_AT} DESC`,
        [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error)
    }

  }

  private async getTaskResponse(result: any) {
    result.forEach((x: { field: string; }) => {
      x.field = JSON.parse(x.field);
    });
    const hash = result.reduce((p: { [x: string]: any[]; },c: { taskId: string | number; }) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c],p), {});
    const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, id: hash[k][0].taskId, lists: hash[k] }));
    return { status: true, data: taskGroupedBy };
  }

  public async getTask(id: any, page: number, pageSize: number) {
    const result = await mysql.findAll(
      `${Tables.PROJECT} p INNER JOIN ${Tables.TASKS} t on t.${TaskTable.PID}=p.${ProjectTable.ID}
      LEFT JOIN ${Tables.SUBTASKS} as st on t.${TaskTable.ID}=st.${SubTaskTable.TID}`,
      [
        `IFNULL(st.${SubTaskTable.FIELD}, p.${ProjectTable.FIELD}) as field, t.${TaskTable.TITLE} as taskTitle, t.${TaskTable.ID} as taskId,
        st.${SubTaskTable.ID} as subtaskId, st.${SubTaskTable.SUB_ID}, st.${SubTaskTable.OS}, st.${SubTaskTable.TITLE} as subTaskTitle, st.${SubTaskTable.BROWSER}, 
        st.${SubTaskTable.SUMMARY}, st.${SubTaskTable.TESTING}, st.${SubTaskTable.USERNAME}, st.${SubTaskTable.DESC}`
      ],
      `t.${TaskTable.IS_DELETE} = 0 AND t.${TaskTable.IS_ENABLE} = 1 AND t.${TaskTable.PID} = ? AND st.${SubTaskTable.IS_ENABLE} = 1
        AND st.${SubTaskTable.IS_DELETE} = 0 ORDER BY t.${SubTaskTable.CREATED_AT} DESC LIMIT ${page},${pageSize}`, [id]
    );
    const taskResponse = await this.getTaskResponse(result);
    return taskResponse;
  }

  public async getAllEmail(id: any) {
    const result = await mysql.findAll(Tables.ORGEMAIL,
      [OrgEmailsTable.ID,OrgEmailsTable.EMAIL], `${OrgEmailsTable.IS_DELETE} = 0 AND ${OrgEmailsTable.IS_ENABLE} = 1 and ${OrgEmailsTable.ORGID} = ?`, [id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }
  public async checkUserOrgExists(uid: any,orgId: any) {
    return await mysql.first(
      Tables.ORGANIZATIONUSER,
      [
        OrganizationUsersTable.ID
      ],
      `${OrganizationUsersTable.USERID} = ?
      AND ${OrganizationUsersTable.ORGID} = ?
      AND ${OrganizationUsersTable.IS_ENABLE} = 1
      AND ${OrganizationUsersTable.IS_DELETE} = 0`,
      [uid,orgId]
    )
  }
  public async getTestRun(id: any) {
    const result = await mysql.findAll(
      `${Tables.SUBTASKRESULTS} sr
      LEFT JOIN ${Tables.TASKRESULT} t on t.${TaskResultTable.TID}=sr.${SubtaskResultsTable.TID}
      LEFT JOIN ${Tables.RESULT} as r on r.${ResultTable.ID}=sr.${SubtaskResultsTable.RID}
      LEFT JOIN ${Tables.PROJECT} as p on p.${ProjectTable.ID}=r.${ResultTable.PID}`,
      [
        `IFNULL(sr.${SubtaskResultsTable.FIELD}, p.${ProjectTable.FIELD}) as field, ANY_VALUE(t.${TaskResultTable.TITLE}) as taskTitle, t.${TaskResultTable.TID} as taskId,
        sr.${SubtaskResultsTable.SID} as subtaskId, sr.${SubtaskResultsTable.SUB_ID}, sr.${SubtaskResultsTable.OS}, sr.${SubtaskResultsTable.TITLE} as subTaskTitle, 
        sr.${SubtaskResultsTable.BROWSER}, sr.${SubtaskResultsTable.SUMMARY}, sr.${SubtaskResultsTable.TESTING}, sr.${SubtaskResultsTable.USERNAME}, sr.${SubtaskResultsTable.DESC}, 
        sr.${SubtaskResultsTable.ID} as subtaskResultId, sr.${SubtaskResultsTable.TESTSTATUS}`
      ],
      `r.${ResultTable.IS_ACTIVE} = 1 AND r.${ResultTable.IS_DELETE} = 0 AND sr.${SubtaskResultsTable.RID} = ? GROUP BY sr.${SubtaskResultsTable.ID} ORDER BY sr.${SubtaskResultsTable.CREATED_AT} DESC`, [id]
    );
    const testRunResponse = await this.getTestRunResponse(result);
    return testRunResponse;
  }

  private async getTestRunResponse(result: any) {
    result.forEach((x: { field: string; }) => {
      x.field = JSON.parse(x.field);
    });
    const hash = result.reduce((p: { [x: string]: any[]; },c: { taskId: string | number; }) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c],p), {});
    const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, taskId: hash[k][0].taskId, lists: hash[k] }));
    return { status: true, data: taskGroupedBy };
  }

  public async getTestRunByProject(id: any) {
    const result = await mysql.findAll(
      `${Tables.SUBTASKRESULTS} sr
      LEFT JOIN ${Tables.TASKRESULT} t on t.${TaskResultTable.TID}=sr.${SubtaskResultsTable.TID}
      LEFT JOIN ${Tables.RESULT} as r on r.${ResultTable.ID}=sr.${SubtaskResultsTable.RID}
      LEFT JOIN ${Tables.PROJECT} as p on p.${ProjectTable.ID}=r.${ResultTable.PID}`,
      [
        `IFNULL(sr.${SubtaskResultsTable.FIELD}, p.${ProjectTable.FIELD}) as field, ANY_VALUE(t.${TaskResultTable.TITLE}) as taskTitle, t.${TaskResultTable.TID} as taskId,
        sr.${SubtaskResultsTable.SID} as subtaskId, sr.${SubtaskResultsTable.SUB_ID}, sr.${SubtaskResultsTable.OS}, sr.${SubtaskResultsTable.TITLE} as subTaskTitle, 
        sr.${SubtaskResultsTable.BROWSER}, sr.${SubtaskResultsTable.SUMMARY}, sr.${SubtaskResultsTable.TESTING}, sr.${SubtaskResultsTable.USERNAME}, sr.${SubtaskResultsTable.DESC}, 
        sr.${SubtaskResultsTable.ID} as subtaskResultId, sr.${SubtaskResultsTable.TESTSTATUS}`
      ],
      `r.${ResultTable.IS_ACTIVE} = 1 AND r.${ResultTable.IS_DELETE} = 0 AND t.${TaskResultTable.PID} = ? GROUP BY sr.${SubtaskResultsTable.ID} 
      ORDER BY sr.${SubtaskResultsTable.CREATED_AT} DESC`, [id]
    );
    const testRunResponse = await this.getTestRunResponse(result);
    return testRunResponse;
  }

  public async getTestRuns(id: any) {
    const result = await mysql.findAll(
      `${Tables.RESULT} r
      LEFT JOIN ${Tables.USER} as u on r.${ResultTable.USERID}=u.${UserTable.ID}`,
      [
        `r.${ResultTable.ID}, r.${ResultTable.DESC}, r.${ResultTable.CREATED_AT}, r.${ResultTable.NAME}, u.${UserTable.FIRSTNAME}`
      ],
      `r.${ResultTable.IS_DELETE} = 0 and r.${ResultTable.PID} = ? ORDER BY r.${ResultTable.CREATED_AT} DESC`, [id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }
  }

  public formAnalyticResponse(result: any[]) {
    let resultArray = []
    let idIndexInResultArray = {}
    
    result.forEach((resultItem: { id: any; created_at: any; testing: string | number; testStatus: string | number; is_automated: any; }) => {
      const id = resultItem.id
      if(!idIndexInResultArray[id]){
        resultArray.push({
          result_id : id,
          created_at: resultItem.created_at,
          total_tests: 0,
          test_type: {},
          test_status: {},
          execution_type: {
            manual_execution: 0,
            automated_execution: 0
          },
          execution_type_percentage: {
            manual_execution: 0,
            automated_execution: 0
          }
        })
        idIndexInResultArray[id] = resultArray.length;
      }

      const index = idIndexInResultArray[id] - 1;
      resultArray[index].total_tests++;

      if (resultArray[index].test_type[resultItem.testing]) {
        resultArray[index].test_type[resultItem.testing]++;
      } else { resultArray[index].test_type[resultItem.testing] = 1; }

      if (resultArray[index].test_status[resultItem.testStatus]) {
        resultArray[index].test_status[resultItem.testStatus]++;
      } else { resultArray[index].test_status[resultItem.testStatus] = 1; }

      if (resultItem.is_automated) {
        resultArray[index].execution_type.automated_execution++;
        resultArray[index].execution_type_percentage.automated_execution = +(resultArray[index].execution_type.automated_execution / resultArray[index].total_tests * 100).toFixed(2);
      } else { 
        resultArray[index].execution_type.manual_execution++ 
        resultArray[index].execution_type_percentage.manual_execution = +(resultArray[index].execution_type.manual_execution / resultArray[index].total_tests * 100).toFixed(2);
      }
    })
    return resultArray;
  }

  public async getTestRunsAnalytics(id: any, limit: any) {
    const result = await mysql.findAll(
      `${Tables.RESULT} r
      LEFT JOIN ${Tables.SUBTASKRESULTS} sr on sr.${SubtaskResultsTable.RID}=r.${ResultTable.ID}
      INNER JOIN (SELECT id FROM ${Tables.RESULT} r WHERE r.${ResultTable.IS_DELETE} = 0 and r.${ResultTable.IS_PROCESSED} = 1 and r.${ResultTable.PID} = '${id}' 
      ORDER BY r.${ResultTable.CREATED_AT} DESC LIMIT ${limit}) as r2 ON r2.${ResultTable.ID}=r.${ResultTable.ID}`,
      [
        `r.${ResultTable.ID}, r.${ResultTable.CREATED_AT}, sr.${SubtaskResultsTable.TESTING}, sr.${SubtaskResultsTable.TESTSTATUS}, r.${ResultTable.IS_AUTOMATED}`
      ]);
    let analyticResponse = this.formAnalyticResponse(result);
    if (result.length >= 0) {
      return analyticResponse;
    } else {
      return false;
    }
  }

  public async sendEmailResult(email: any[], data: { result: any; testCases: any; pname: any; testName: any; }) {

    const replaceData = {
      '{pass}': data.result.pass,
      '{failed}': data.result.failed,
      '{untested}': data.result.untested,
      '{testCases}': data.testCases||'',
      '{pname}':data.pname,
      '{testName}':data.testName
    };

    SendEmail.sendRawMail('test-result', replaceData, email, data.pname+' Test result report'); // sending email
    return ResponseBuilder.data({ registered: true });
  }
  public async getUserByOrg(id: any) {
    try {
      const result =  await mysql.findAll(`${Tables.USER} u
        LEFT JOIN ${Tables.ORGANIZATIONUSER} o on o.${OrganizationUsersTable.USERID} = u.${UserTable.ID}`,[
        `u.${UserTable.ID}`,
        `u.${UserTable.ORGANIZATION}`,
        `u.${UserTable.DOMAIN}`,
        `u.${UserTable.COUNTRY_CODE}`
      ],
        `o.${OrganizationUsersTable.ORGID} = ?`,
        [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
    } catch (error) {
      console.log('error====='+error)
    }

  }

}
