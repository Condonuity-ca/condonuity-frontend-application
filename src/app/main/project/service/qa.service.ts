import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class QaService {

  public projectQaSubject: BehaviorSubject<any>;
  public projectQaList : Observable<any>;

  public newQaSubject: BehaviorSubject<any>;
  public newQaForProject : Observable<any>;


  constructor() { 
    this.projectQaSubject = new BehaviorSubject<any>(null);
    this.projectQaList = this.projectQaSubject.asObservable();

    this.newQaSubject = new BehaviorSubject<any>(null);
    this.newQaForProject = this.newQaSubject.asObservable();
  }
}
