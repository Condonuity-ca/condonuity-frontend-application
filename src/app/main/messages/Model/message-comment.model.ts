import { User } from './user.model';
import { Organisation } from './organisation.model';

export class MessageComment {
    id: number;
    userId: number;
    userType: number;
    threadId: number;
    comment: string;
    createdAt: string;
    modifiedDate: string;
    files:any[];
    user:User;

    fromUser:User;
    fromOrganisation:any;   

    formatedCreatedDate:string;
}
