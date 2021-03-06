import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { CondoBrowserService } from '../condo-browser.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'view-condos',
  templateUrl: './view-condos.component.html',
  styleUrls: ['./view-condos.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ViewCondosComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;
  isValid: boolean = false;

  /**
   * Constructor
   *
   */
  constructor(
    private _condoBrowserService: CondoBrowserService,
    private router: Router
  ) {
    this._unsubscribeAll = new Subject();
    this._condoBrowserService.getClientData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data == null) {
          this.isValid = false;
          this.router.navigate(['/browseCondos/']);
        } else {
          this.isValid = true;
        }
      }
    )
  }


  ngOnInit(): void {

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
