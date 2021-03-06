import { Component, OnDestroy, OnInit, ViewEncapsulation,ElementRef, ViewChild,Inject } from '@angular/core';
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
  userData : User;
}


@Component({
    selector     : 'faq',
    templateUrl  : './faq.component.html',
    styleUrls    : ['./faq.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FaqComponent implements OnInit, OnDestroy
{
    about: any;
    approvalForm: FormGroup;
    userDetails:User;
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

   

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.approvalForm = this._formBuilder.group({
            publishProject   :this._formBuilder.group({
              publish : ['',Validators.required],
              publishApproval : ['']
              }),
            vendorReview   : this._formBuilder.group({
              review : ['',Validators.required],
              reviewApproval : ['']
              }),
            projectAward : this._formBuilder.group({
              award : ['',Validators.required],
              awardApproval : ['']  
              })
        });

    // this.userDetails= {clientId:1,firstName:'John',lastName:'Wick',email:'johnwick@par.com',role:'Manager',admin:false};




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




export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if( !control.parent || !control ) {
      return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if( !password || !passwordConfirm ) {
      return null;
  }

  if( passwordConfirm.value === '' ) {
      return null;
  }

  if( password.value === passwordConfirm.value ) {
      return null;
  }

  return {passwordsNotMatching: true};
};
