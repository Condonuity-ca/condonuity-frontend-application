import { TaskComment } from '../model/task-comment.model';
import { ClientUser } from '../model/client-user.model';

export class Task {
    id:number;
    clientOrganisationId:number;
    taskDescription:string;
    priority:number;
    closureDate:string;
    createdBy:number;
    assignedTo:ClientUser[];
    modifiedBy:string;
    isOther:number;
    othersName:string;
    taskStatus:number;
    createdAt:string;
    modifiedDate:string;
    comments:TaskComment[];

    createdByUser:string;
    modifiedByUser:string;
    priorityText:string;
    statusText:string;
    createdDate:string;
    modifiedDisplayDate:string;
    assineeDisplayName:string;
    commentsCount:number;
}
