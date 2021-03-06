import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ProjectPostingService {

    private _projectData: BehaviorSubject<any>;
    private _bidEvent: BehaviorSubject<any>;

    public selectedVendorProjectTabSubject: BehaviorSubject<any>;
    public selectedVendorProjectTab: Observable<any>;

    public _shouldRefreshVendorProject: BehaviorSubject<any>;
    public shouldRefreshProject: Observable<any>;

    public _projectWithBidData: BehaviorSubject<any>;
    public projectWithBidData: Observable<any>;


    constructor() {
        this._projectData = new BehaviorSubject(null);
        this._bidEvent = new BehaviorSubject(null);
        this._projectWithBidData = new BehaviorSubject(null);
        this._shouldRefreshVendorProject = new BehaviorSubject(null);


        this.selectedVendorProjectTabSubject = new BehaviorSubject<any>(null);
        this.selectedVendorProjectTab = this.selectedVendorProjectTabSubject.asObservable();

        this.shouldRefreshProject = this._shouldRefreshVendorProject.asObservable();
        this.projectWithBidData = this._projectWithBidData.asObservable();
    }

    get getProjectData(): Observable<any> {
        return this._projectData.asObservable();
    }

    setProjectData(data) {
        this._projectData.next(data);
    }

    get getProjectWithBidInfo(): Observable<any> {
        return this._projectWithBidData.asObservable();
    }

    setProjectWithBidInfo(data) {
        this._projectWithBidData.next(data);
    }

    setBidEvent(data) {
        let bidStatus: number = 0;
        if (data == 'startBid') {
            bidStatus = 1;
        } else if (data == 'editBid') {
            bidStatus = 1;
        } else if (data == 'pullBid') {
            bidStatus = 0;
        } else if (data == 'submitBid') {
            bidStatus = 2;
        }
        this._bidEvent.next(bidStatus);
    }

    get bidEvent(): Observable<any> {
        return this._bidEvent.asObservable();
    }
}
