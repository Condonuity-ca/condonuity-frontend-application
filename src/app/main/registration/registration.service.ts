import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RegistrationService {

  public currentCorporationSubject: BehaviorSubject<any>;
  public userData: Observable<any>;

  constructor() {
    this.currentCorporationSubject = new BehaviorSubject<any>(null);
    this.userData = this.currentCorporationSubject.asObservable();
  }
}
