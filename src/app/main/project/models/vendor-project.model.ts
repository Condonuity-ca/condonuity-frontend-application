
import { QuestionAns } from '../models/question-ans.model'

export class VendorProject {
    projectId: number;
    clientOrganisationId: number;
    clientId: number;
    projectName: string;
    projectModifiedBy: number;
    tags: any;
    bidEndDate: string;
    projectStartDate: string;
    projectCompletionDeadline: string;
    estimatedBudget: string;
    duration: string;
    description: string;
    specialConditions: string;
    city: string;
    contractType: number;
    insuranceRequired: number;
    postType: number;
    status: number;
    awardedBidId: number;
    createdAt: string;
    modifiedDate: string;
    projectProducts: any;
    vendorBid: any;
    questionAnswers: QuestionAns[];
    projectFiles: [];

    tagArray: string[];
    cityArray: string[];

    contractMessage: string;
    statusMessage: string;
    insuranceMessage: string;
    tagListString: string;

    imageAttachments: any[];
    docAttachments: any[];

    condoName: string;
    condoCity: string;
}