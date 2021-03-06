import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class VendorBrowserService {
    private _vendorData: BehaviorSubject<any>;
    private _selectedReview: BehaviorSubject<any>;


    constructor() {
        this._vendorData = new BehaviorSubject(null);
        this._selectedReview = new BehaviorSubject(null);
    }

    get getVendorData(): Observable<any> {
        return this._vendorData.asObservable();
    }

    setVendorData(data) {
        this._vendorData.next(data);
    }

    get getSelectedReview(): Observable<any> {
        return this._selectedReview.asObservable();
    }

    setReviewData(data) {
        this._selectedReview.next(data);
    }

}
