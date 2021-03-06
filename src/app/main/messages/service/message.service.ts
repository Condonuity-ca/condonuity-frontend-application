import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messageSubject: BehaviorSubject<any>;
  public message: Observable<any>;

  public selectedMessageTabSubject: BehaviorSubject<any>;
  public selectedMessageTab: Observable<any>;

  constructor() {
    this.messageSubject = new BehaviorSubject<any>(null);
    this.message = this.messageSubject.asObservable();

    this.selectedMessageTabSubject = new BehaviorSubject<any>(null);
    this.selectedMessageTab = this.selectedMessageTabSubject.asObservable();
  }
}


