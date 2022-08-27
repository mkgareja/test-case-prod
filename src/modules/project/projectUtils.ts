import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { SendEmail } from '../../helpers/sendEmail';
import { Tables, UserTable,OrgEmailsTable,TestMergeTable,ProjectTable,TestrunsTable, projectUsersTable,OrganizationUsersTable, TaskTable, SubTaskTable, ResultTable, SubtaskResultsTable } from '../../config/tables';

export class ProjectUtils {
   // Get User devices
   
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
  public async updateUserProject(uid,Info,pid): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.PROJECTUSERS, Info, `${projectUsersTable.USERID} = ? and ${projectUsersTable.PROJECTID} = ?`, [uid,pid]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async removeEmailOrg(Info,id): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.ORGEMAIL, Info, `${OrgEmailsTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async deleteUserProject(uid,pid): Promise<ResponseBuilder> {
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
  public async updateTestRun(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.TESTRUNS, Info, `${ProjectTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async updateProject(id,Info): Promise<ResponseBuilder> {
    const  result = await mysql.updateFirst(Tables.PROJECT, Info, `${ProjectTable.ID} = ?`, [id]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async getProjects(id) {
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
  public async getProjectsByOrg(id) {
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
    const hash = result.reduce((p,c) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c],p), {});
    const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, id: hash[k][0].taskId, lists: hash[k] }));
    return { status: true, data: taskGroupedBy };
  }

  public async getTask(id: any) {
    const result = await mysql.findAll(
      `${Tables.PROJECT} p INNER JOIN ${Tables.TASKS} t on t.${TaskTable.PID}=p.${ProjectTable.ID}
      LEFT JOIN ${Tables.SUBTASKS} as st on t.${TaskTable.ID}=st.${SubTaskTable.TID}`,
      [
        `IFNULL(st.${SubTaskTable.FIELD}, p.${ProjectTable.FIELD}) as field, t.${TaskTable.TITLE} as taskTitle, t.${TaskTable.ID} as taskId,
        st.${SubTaskTable.ID} as subtaskId, st.${SubTaskTable.SUB_ID}, st.${SubTaskTable.OS}, st.${SubTaskTable.TITLE} as subTaskTitle, st.${SubTaskTable.BROWSER}, 
        st.${SubTaskTable.SUMMARY}, st.${SubTaskTable.TESTING}, st.${SubTaskTable.USERNAME}, st.${SubTaskTable.DESC}`
      ],
        `t.${TaskTable.IS_DELETE} = 0 AND t.${TaskTable.IS_ENABLE} = 1 AND t.${TaskTable.PID} = ? AND st.${SubTaskTable.IS_ENABLE} = 1
        AND st.${SubTaskTable.IS_DELETE} = 0 ORDER BY t.${SubTaskTable.CREATED_AT} DESC`, [id]
    );
    const taskResponse = await this.getTaskResponse(result);
    return taskResponse;
  }

  public async getAllEmail(id) {
    const result = await mysql.findAll(Tables.ORGEMAIL,
      [OrgEmailsTable.ID,OrgEmailsTable.EMAIL], `${OrgEmailsTable.IS_DELETE} = 0 AND ${OrgEmailsTable.IS_ENABLE} = 1 and ${OrgEmailsTable.ORGID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async checkUserOrgExists(uid,orgId) {
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
  public async getTestRun(id) {
    const result = await mysql.findAll(Tables.TESTRUNS,
      [TestrunsTable.FIELD, TestrunsTable.DATA, TestrunsTable.DESCRIPTION, TestrunsTable.CREATED_AT, TestrunsTable.NAME], `${TestrunsTable.IS_DELETE} = 0 AND ${TestrunsTable.IS_ENABLE} = 1 and ${TestrunsTable.ID} = ? ORDER BY ${TestrunsTable.CREATED_AT} DESC`, [id]);
    if (result.length >= 0) {
      return result;
    } else {
      return false;
    }

  }

  private async getTestRunResponse(result: any) {
    result.forEach((x: { field: string; }) => {
      x.field = JSON.parse(x.field);
    });
    const hash = result.reduce((p,c) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c],p), {});
    const taskGroupedBy = Object.keys(hash).map(k => ({ taskTitle: hash[k][0].taskTitle, id: hash[k][0].taskId, lists: hash[k] }));
    return { status: true, data: taskGroupedBy };
  }

  public async getTestRunByProject(id) {
    const result = await mysql.findAll(
      `${Tables.PROJECT} p INNER JOIN ${Tables.TASKS} t on t.${TaskTable.PID}=p.${ProjectTable.ID}
      LEFT JOIN ${Tables.SUBTASKS} as st on t.${TaskTable.ID}=st.${SubTaskTable.TID}
      LEFT JOIN ${Tables.RESULT} as r on r.${ResultTable.PID}=st.${SubTaskTable.PID}
      LEFT JOIN ${Tables.SUBTASKRESULTS} as sr on sr.${SubtaskResultsTable.RESULT_ID}=r.${ResultTable.ID}`,
      [
        `IFNULL(st.${SubTaskTable.FIELD}, p.${ProjectTable.FIELD}) as field, t.${TaskTable.TITLE} as taskTitle, t.${TaskTable.ID} as taskId,
        st.${SubTaskTable.ID} as subtaskId, st.${SubTaskTable.SUB_ID}, st.${SubTaskTable.OS}, st.${SubTaskTable.TITLE} as subTaskTitle, st.${SubTaskTable.BROWSER}, 
        st.${SubTaskTable.SUMMARY}, st.${SubTaskTable.TESTING}, st.${SubTaskTable.USERNAME}, st.${SubTaskTable.DESC}, 
        sr.${SubtaskResultsTable.RESULT_ID}, sr.${SubtaskResultsTable.STATUS}`
      ],
        `t.${SubTaskTable.IS_DELETE} = 0 AND t.${SubTaskTable.IS_ENABLE} = 1 and t.${TaskTable.PID} = ? ORDER BY t.${SubTaskTable.CREATED_AT} DESC`, [id]
    );
    const testRunResponse = await this.getTestRunResponse(result);
    return testRunResponse;
    if (result) {
      return result;
    } else {
      return false;
    }
  }

  public async getTestRuns(id) {
    const result = await mysql.findAll(
      `${Tables.TESTRUNS} tr
      LEFT JOIN ${Tables.USER} as u on tr.${TestrunsTable.UPDATEDBY}=u.${UserTable.ID}
      LEFT JOIN ${Tables.RESULT} as r on r.${ResultTable.PID}=tr.${TestrunsTable.PROJECTID}`,
      [
        `tr.${TestrunsTable.ID},tr.${TestrunsTable.DESCRIPTION},tr.${TestrunsTable.CREATED_AT},tr.${TestrunsTable.NAME},
        u.${UserTable.FIRSTNAME},r.${ResultTable.ID} as resultId`
      ], 
        `tr.${TestrunsTable.IS_DELETE} = 0 AND tr.${TestrunsTable.IS_ENABLE} = 1 and tr.${TestrunsTable.ISPROCESSING} = 0 and tr.${TestrunsTable.PROJECTID} = ? ORDER BY tr.${TestrunsTable.CREATED_AT} DESC`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async getTestRunsAnalytics(id:any,limit:any) {
    const result = await mysql.findAll(
      `${Tables.TESTRUNS} tr
      LEFT JOIN ${Tables.USER} as u on tr.${TestrunsTable.UPDATEDBY}=u.${UserTable.ID}`,
      [
        `tr.${TestrunsTable.ID},tr.${TestrunsTable.DATA},tr.${TestrunsTable.DESCRIPTION},tr.${TestrunsTable.UPDATEDAT},tr.${TestrunsTable.NAME},u.${UserTable.FIRSTNAME}`
      ], 
        `tr.${TestrunsTable.IS_DELETE} = 0 AND tr.${TestrunsTable.IS_ENABLE} = 1 and tr.${TestrunsTable.PROJECTID} = ? ORDER BY tr.${TestrunsTable.UPDATEDAT} DESC LIMIT ${limit}`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  
  public async sendEmailResult(email, data) {

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
  public async getUserByOrg(id) {
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
