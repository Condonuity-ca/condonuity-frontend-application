import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { VendorBrowserService } from '../vendor-browser.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'view-vendors',
  templateUrl: './view-vendors.component.html',
  styleUrls: ['./view-vendors.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ViewVendorsComponent implements OnInit, OnDestroy {
  // Private
  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _vendorBrowserService: VendorBrowserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    let route = this.router.url;
    console.log();
    this._vendorBrowserService.getVendorData.subscribe(
      data => {
        if (data == null) {
          this.isValid = false;
          if (route.includes('browseVendors')) {
            this.router.navigate(['/browseVendors/']);
          } else if (route.includes('myreview')) {
            this.router.navigate(['/myreview/'])
          }
        } else {
          this.isValid = true;
        }
      }
    )
  }

  isValid: boolean = false;

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
