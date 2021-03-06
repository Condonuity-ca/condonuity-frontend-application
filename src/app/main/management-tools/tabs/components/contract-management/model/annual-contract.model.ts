export class AnnualContract {
    id:number;
    clientOrganisationId:number;
    clientId:number;
    vendorName:string;
    services:string;
    term:number;
    termUnits:number;
    signedDate:any;
    expiryDate:any;
    renewalType:number;
    cost:number;
    costTermUnits:number;
    gstAvailablity:number;
    cancellationTerm:number;
    cancellationUnits:number;
    expectedIncrease:number;
    notes:string;
    status:number;
    createdAt:string;
    modifiedDate:string;


    termDisplayUnit:string;
    renewal:string;
    gstInclusion:string;
    costTerm:string;
    cancelUnits:string;
}

