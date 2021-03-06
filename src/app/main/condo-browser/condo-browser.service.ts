import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class CondoBrowserService {
    private _clientData: BehaviorSubject<any>;


    constructor() {
           // Set the private defaults
        this._clientData = new BehaviorSubject(null);
    }

    get getClientData(): Observable<any> {
        return this._clientData.asObservable();
    }

    setClientData(data) {
        this._clientData.next(data);
    }

}
