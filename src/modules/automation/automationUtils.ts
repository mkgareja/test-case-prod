import * as mysql from 'jm-ez-mysql';

import { OrganizationTable, Tables } from '../../config/tables';

export class AutomationUtils {

    public async isOrgExist(organisationId: String) {
        const orgExist = await mysql.first(Tables.ORGANIZATION, [OrganizationTable.ID], `${OrganizationTable.ID} = ?`, [organisationId]);
        if (orgExist) {
            return true;
        }
        return false;
    }

    public async setProjects(result: any) {
        let projects = [];
        for (const projectData in result) {
            const projectItem = result[projectData];
            projects.push({ project_id: projectItem.id, project_name: projectItem.name });
        }
        return projects;
    }

    public async setTasksSubtasks(result: any) {
        let tasksSubtasks = [];
        for (const taskSubtaskData in result.data) {
            const taskSubtaskItem = result.data[taskSubtaskData];
            let subTaskRearrangedData = [];
            for (const subTaskItem in taskSubtaskItem.lists) {
                const subtaskData = taskSubtaskItem.lists[subTaskItem];
                subTaskRearrangedData.push({ subtask_id: subtaskData.subtaskId, subtask_title: subtaskData.subTaskTitle });
            }
            tasksSubtasks.push({ task_id: taskSubtaskItem.id, task_title: taskSubtaskItem.taskTitle, subtasks: subTaskRearrangedData });
        }
        return tasksSubtasks;
    }

}