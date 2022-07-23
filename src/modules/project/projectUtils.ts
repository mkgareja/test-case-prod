import * as mysql from 'jm-ez-mysql';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { SendEmail } from '../../helpers/sendEmail';
import { Tables, UserTable,OrgEmailsTable,StaticContentTable,ProjectTable,TestrunsTable, projectUsersTable,OrganizationUsersTable, OrganizationTable, TaskTable, SubTaskTable } from '../../config/tables';

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
    return ResponseBuilder.data({ data:data });
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
        LEFT JOIN ${Tables.PROJECTUSERS} pu on p.${ProjectTable.ID} = pu.${projectUsersTable.PROJECTID}`,[
        `p.${ProjectTable.ID}`,
        `p.${ProjectTable.NAME}`,
        `p.${ProjectTable.TYPE}`,
        `p.${ProjectTable.DESC}`,
        `p.${ProjectTable.CREATED_AT}`,
        `pu.${projectUsersTable.ROLE}`,
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
      LEFT JOIN ${Tables.PROJECTUSERS} pu on p.${ProjectTable.ID} = pu.${projectUsersTable.PROJECTID}`,[
      `p.${ProjectTable.ID}`,
      `p.${ProjectTable.NAME}`,
      `p.${ProjectTable.TYPE}`,
      `p.${ProjectTable.DESC}`,
      `p.${ProjectTable.CREATED_AT}`,
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

  private async groupByTaskID(result: any) {
    const hash = result.reduce((p,c) => (p[c.taskId] ? p[c.taskId].push(c) : p[c.taskId] = [c],p), {});
    const newData = Object.keys(hash).map(k => ({model: hash[k][0].name, id: hash[k][0].taskId, lists: hash[k]}));
    return newData;
  }

  private async getTaskResponse(result: any) {
    result.forEach((x: { field: string; }) => {
      x.field = JSON.parse(x.field);
    });
    const taskGroupedBy = await this.groupByTaskID(result);
    let status = true;
    if (taskGroupedBy.length == 0) {
      status = false;
    }
    const res = {
      status: status,
      field: [],
      data: taskGroupedBy
    };
    return res;
  }

  public async getTask(id: any) {
    const result = await mysql.findAll(
      `${Tables.PROJECT} p INNER JOIN ${Tables.TASKS} t on t.${TaskTable.PID}=p.${ProjectTable.ID}
      INNER JOIN ${Tables.SUBTASKS} as st on t.${TaskTable.ID}=st.${SubTaskTable.TID}`,
      [
        `IFNULL(st.${SubTaskTable.FIELD}, p.${ProjectTable.FIELD}) as field, t.${TaskTable.NAME}, t.${TaskTable.ID} as taskId,
        st.${SubTaskTable.ID} as subtaskId, st.${SubTaskTable.SUB_ID}, st.${SubTaskTable.OS}, st.${SubTaskTable.TITLE}, st.${SubTaskTable.BROWSER}, 
        st.${SubTaskTable.EXP_RES}, st.${SubTaskTable.TESTING}, st.${SubTaskTable.USERNAME}, st.${SubTaskTable.DESC}`
      ],
        `t.${SubTaskTable.IS_DELETE} = 0 AND t.${SubTaskTable.IS_ENABLE} = 1 and t.${TestrunsTable.PROJECTID} = ? ORDER BY t.${SubTaskTable.CREATED_AT} DESC`, [id]
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
  public async getTestRunByProject(id) {

    const result = await mysql.first(Tables.TESTRUNS,
      [TestrunsTable.NAME,TestrunsTable.ID,TestrunsTable.FIELD, TestrunsTable.DATA, TestrunsTable.DESCRIPTION, TestrunsTable.CREATED_AT, TestrunsTable.NAME], `${TestrunsTable.IS_DELETE} = 0 AND ${TestrunsTable.IS_ENABLE} = 1 and ${TestrunsTable.ISPROCESSING} = 1 and ${TestrunsTable.PROJECTID} = ? ORDER BY ${TestrunsTable.CREATED_AT} DESC`, [id]);
    if (result) {
      return result;
    } else {
      return false;
    }


  }
  public async getTestRuns(id) {
    const result = await mysql.findAll(
      `${Tables.TESTRUNS} tr
      LEFT JOIN ${Tables.USER} as u on tr.${TestrunsTable.UPDATEDBY}=u.${UserTable.ID}`,
      [
        `tr.${TestrunsTable.ID},tr.${TestrunsTable.DESCRIPTION},tr.${TestrunsTable.CREATED_AT},tr.${TestrunsTable.NAME},u.${UserTable.FIRSTNAME}`
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
