import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MenuService {


  public currentCorporationSubject: BehaviorSubject<any>;
  public selectedOrganization: Observable<any>;

  public currentPageSearchBarSubject: BehaviorSubject<any>;
  public searchBarIndexForCurrentPage: Observable<any>;

  public searchBarSubject: BehaviorSubject<any>;
  public requiredSearchDetails: Observable<any>;

  constructor() {
    this.currentCorporationSubject = new BehaviorSubject<any>(null);
    this.selectedOrganization = this.currentCorporationSubject.asObservable();

    this.currentPageSearchBarSubject = new BehaviorSubject<any>(null);
    this.searchBarIndexForCurrentPage = this.currentPageSearchBarSubject.asObservable();

    this.searchBarSubject = new BehaviorSubject<any>(null);
    this.requiredSearchDetails = this.searchBarSubject.asObservable();
  }
}
