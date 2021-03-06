import * as moment from 'moment';

export class ProjectAward {
    awardDate: string;
    awardedBidId: string;
    comments: string;
    projectId: string;
    startDate: string;
    totalPrice: string;
    vendorOrganisationId: string;
    vendorOrganisationName: string;
    duration: string;
    attachments: any[];

    constructor(data) {
        if (data.awardDate != null && data.awardDate != '') {
            this.awardDate = moment(data.awardDate).format('MM/DD/YYYY');
        }

        this.duration = data.duration;
        if (this.duration == '') {
            this.duration = 'NA';
        }
        this.comments = data.comments;
        this.totalPrice = data.totalPrice;
        this.startDate = moment(data.startDate).format('MM/DD/YYYY');
    }
}
