export class VendorDetails {
    email:string;
    admin:boolean;
    firstName:string;
    lastName:string;
    userType:number;
    userRole:number;
    role:string;
    userId:number;
    vendorOrganisationId:number;
    notifications:{
        marketPotential:boolean;
        newReviews:boolean;
        newMessages:boolean;
        accountChanges:boolean;
        projectChanges:boolean;
        expiringPotentials:boolean;
        questionsAnswers:boolean;
        bidsPotentials:boolean;
    };
    primaryMail:boolean;

}
