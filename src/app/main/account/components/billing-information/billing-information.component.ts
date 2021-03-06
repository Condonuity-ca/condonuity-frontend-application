import { Component, OnDestroy, OnInit, ViewEncapsulation,ElementRef, ViewChild,Inject,Input } from '@angular/core';
import { Subject,Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators,FormControl,FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { User } from 'app/main/account/models/user.model';
import { BillingInfo } from 'app/main/account/models/billing-info.model';
import {MatDialog,MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
export interface DialogData {
  billingData: BillingInfo;
}


@Component({
    selector     : 'billing-information',
    templateUrl  : './billing-information.component.html',
    styleUrls    : ['./billing-information.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class BillingInformationComponent implements OnInit, OnDestroy
{
  @Input() billInfo: BillingInfo;
    about: any;
    // billingForm: FormGroup;
    userDetails:User[];
    userApproval={publish:false,award:false,vendor:false};
    // Private
    private _unsubscribeAll: Subject<any>;
  
    /**
     * Constructor
     *
     * @param {ProfileService} _profileService
     */
    constructor(
        // private _profileService: ProfileService
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }


    openBilingDialog() {
      const dialogRef=this.dialog.open(BillingInfoDialog,{
        data: {billingData: this.billInfo}
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result != undefined  && result != '')
        {
          this.updateBilling(result);
        }

      });
  
    }
    
    updateBilling(data)
    {
      this.billInfo={billingDetails:{street:data['streetAddress'],city:data['city'],province:data['province'],postalCode:data['postalCode']},paymentDetails:{cardName:data['cardName'],cardNumber:data['cardNumber'],expiryDate:data['expiryDate'],securityCode:data['securityCode']}};
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


@Component({
  selector: 'billing-info-dialog',
  templateUrl: 'billing-info-dialog.html',
})
export class BillingInfoDialog   {

  billingForm: FormGroup;
  constructor(
      // private _profileService: ProfileService
      private _formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<BillingInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private datePipe : DatePipe

  )
  {
    let billingInfo = this.data.billingData.billingDetails;
    let paymentInfo = this.data.billingData.paymentDetails;

    let expiry = this.datePipe.transform(paymentInfo.expiryDate, 'yyyy-MM-ddThh:mm:ssZ');

    this.billingForm = this._formBuilder.group({
      streetAddress   : [billingInfo.street,Validators.required],
      city   : [billingInfo.city,Validators.required],
      province : [billingInfo.province,Validators.required],
      postalCode      : [billingInfo.postalCode,Validators.required],
      cardName     : [paymentInfo.cardName,Validators.required],
      cardNumber : [paymentInfo.cardNumber,Validators.required],
      expiryDate   : [expiry,Validators.required],
      securityCode   : [paymentInfo.securityCode, [Validators.pattern("^[0-9]*$"),Validators.maxLength(4),Validators.required]]
  });
  }
  editCorporation()
  {
      // console.log(this.billingForm.value);
  }
}
