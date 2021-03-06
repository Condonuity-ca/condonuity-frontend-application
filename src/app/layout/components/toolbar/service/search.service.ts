import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class SearchService {
  public currentProjectsSearchSubject: BehaviorSubject<any>;
  public currentProjectsSearchResults : Observable<any>;

  public historyProjectsSearchSubject: BehaviorSubject<any>;
  public historyProjectsSearchResults : Observable<any>;

  public favoriteProjectsSearchSubject: BehaviorSubject<any>;
  public favoriteProjectsSearchResults : Observable<any>;

  public marketPlaceProjectsSearchSubject: BehaviorSubject<any>;
  public marketPlaceProjectsSearchResults: Observable<any>;

  public browseVendorsSearchSubject: BehaviorSubject<any>;
  public browseVendorsSearchResults: Observable<any>;

  public browseCondosSearchSubject: BehaviorSubject<any>;
  public browseCondosSearchResults: Observable<any>;

  public internalMessagesSearchSubject: BehaviorSubject<any>;
  public internalMessagesSearchResults: Observable<any>;

  public externalMessagesSearchSubject: BehaviorSubject<any>;
  public externalMessagesSearchResults: Observable<any>;

  public reviewsSearchSubject: BehaviorSubject<any>;
  public reviewsSearchResults: Observable<any>;

  public tasksSearchSubject: BehaviorSubject<any>;
  public tasksSearchResults: Observable<any>;

  public contractsSearchSubject: BehaviorSubject<any>;
  public contractsSearchResults: Observable<any>;

  public buildingRepoSearchSubject: BehaviorSubject<any>;
  public buildingRepoSearchResults: Observable<any>;

  public clearSearchSubject: BehaviorSubject<any>;
  public clearSearchForIndex: Observable<any>;

  constructor() { 
    this.currentProjectsSearchSubject = new BehaviorSubject<any>(null);
    this.currentProjectsSearchResults = this.currentProjectsSearchSubject.asObservable();

    this.historyProjectsSearchSubject = new BehaviorSubject<any>(null);
    this.historyProjectsSearchResults = this.historyProjectsSearchSubject.asObservable();

    this.favoriteProjectsSearchSubject = new BehaviorSubject<any>(null);
    this.favoriteProjectsSearchResults = this.favoriteProjectsSearchSubject.asObservable();

    this.marketPlaceProjectsSearchSubject = new BehaviorSubject<any>(null);
    this.marketPlaceProjectsSearchResults = this.marketPlaceProjectsSearchSubject.asObservable();

    this.browseVendorsSearchSubject = new BehaviorSubject<any>(null);
    this.browseVendorsSearchResults = this.browseVendorsSearchSubject.asObservable();

    this.browseCondosSearchSubject = new BehaviorSubject<any>(null);
    this.browseCondosSearchResults = this.browseCondosSearchSubject.asObservable();

    this.internalMessagesSearchSubject = new BehaviorSubject<any>(null);
    this.internalMessagesSearchResults = this.internalMessagesSearchSubject.asObservable();

    this.externalMessagesSearchSubject = new BehaviorSubject<any>(null);
    this.externalMessagesSearchResults = this.externalMessagesSearchSubject.asObservable();

    this.reviewsSearchSubject = new BehaviorSubject<any>(null);
    this.reviewsSearchResults = this.reviewsSearchSubject.asObservable();

    this.tasksSearchSubject = new BehaviorSubject<any>(null);
    this.tasksSearchResults = this.tasksSearchSubject.asObservable();

    this.contractsSearchSubject = new BehaviorSubject<any>(null);
    this.contractsSearchResults = this.contractsSearchSubject.asObservable();

    this.buildingRepoSearchSubject = new BehaviorSubject<any>(null);
    this.buildingRepoSearchResults = this.buildingRepoSearchSubject.asObservable();

    this.clearSearchSubject = new BehaviorSubject<any>(null);
    this.clearSearchForIndex = this.clearSearchSubject.asObservable();

  }
}
