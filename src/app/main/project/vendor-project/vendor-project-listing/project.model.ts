export class Project {
    projectId:number;
    clientOrganisationId: number;
    clientId: number;
    projectName:string;
    projectModifiedBy:number;
    tags:string;
    bidEndDate:string;
    projectStartDate:string;
    projectCompletionDeadline:string;
    estimatedBudget:string;
    duration:string;
    description:string;
    specialConditions:string;
    city:string;
    contractType:number;
    insuranceRequired:number;
    postType:number;
    status:number;
    awardedBidId:number;
    createdAt:string;
    modifiedDate:string;
    projectProducts:any;

    tagArray:string[];
    cityArray:string[];

    contractMessage:string;
    statusMessage:string;
}