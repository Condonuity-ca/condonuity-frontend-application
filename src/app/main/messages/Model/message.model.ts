import { MessageComment } from './message-comment.model';
import { User } from 'app/main/account/models/user.model';
import { Organisation } from './organisation.model';

export class Message {
    id: number;
    userType: number;
    organisationId: number;
    userId: number;
    user:User;
    organisation:Organisation;

    fromOrganisation:Organisation;
    fromUser:User;

    targetOrganisations:Organisation[];

    threadSubject: string;
    threadDescription: string;
    createdAt: string;
    modifiedDate: string;
    files:any[];
    comments:MessageComment[];

    formatedCreatedDate:string;
    formatedModifiedDate:string;

    messageType:number;
}
