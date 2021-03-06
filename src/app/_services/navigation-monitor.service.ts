import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class NavigationMonitorService {
    private _navigationPageTitle: BehaviorSubject<any>;

    constructor()
    {
    

        // Set the private defaults
        this._navigationPageTitle = new BehaviorSubject(null);
    }

    get getNavigationTitle(): Observable<any>
    {
        return this._navigationPageTitle.asObservable();
    }

    setNavigationTitle(title:string)
    {
        this._navigationPageTitle.next(title);
    }
}
