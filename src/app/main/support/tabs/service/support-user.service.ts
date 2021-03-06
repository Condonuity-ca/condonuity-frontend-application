import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SupportUserService {
  public clientProfileSubject: BehaviorSubject<any>;
  public clientProfileInfo: Observable<any>;

  public vendorProfileSubject: BehaviorSubject<any>;
  public vendorProfileInfo: Observable<any>;

  public currentProjectSubject: BehaviorSubject<any>;
  public currentProject: Observable<any>;

  constructor() {
    this.clientProfileSubject = new BehaviorSubject<any>(null);
    this.clientProfileInfo = this.clientProfileSubject.asObservable();

    this.vendorProfileSubject = new BehaviorSubject<any>(null);
    this.vendorProfileInfo = this.vendorProfileSubject.asObservable();

    this.currentProjectSubject = new BehaviorSubject<any>(null);
    this.currentProject = this.currentProjectSubject.asObservable();
  }
}
