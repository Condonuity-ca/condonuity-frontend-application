import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService } from '../../../../services/app.service';
import { CommonFunctionsService } from '../../../../../../app/_services/common-functions.service';

import { resetFakeAsyncZone } from '@angular/core/testing';


@Component({
  selector: 'vendor-internal',
  templateUrl: './vendor-internal.component.html',
  styleUrls: ['./vendor-internal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class VendorInternalComponent implements OnInit, OnDestroy {
  @Input()
 
  

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
    private _appService : AppService,
    private _commonFunctionsService: CommonFunctionsService
  ) {
   

  }


  openCreateThreadDialog() {

        const CreateThreadDialogRef = this.dialog.open(CreateThreadDialog,{width: '50%',height:'auto'});


        CreateThreadDialogRef.afterClosed().subscribe(result => {
            if(result != undefined  && result != '')
            {
              
            }
        });
      }







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
  
  }
}


@Component({
    selector: 'create-thread-dialog',
    templateUrl: 'create-thread-dialog.html',
    animations   : fuseAnimations

  })
  export class CreateThreadDialog   {
    spot={ug:true,gl:true};
    createThreadform: FormGroup;
    profileData;
    constructor(
        // private _profileService: ProfileService
        private _formBuilder: FormBuilder
    )

{
        this.createThreadform = this._formBuilder.group({

            to   : ['',Validators.required],  
            subject   : ['',Validators.required],
            description   : ['',Validators.required]
           
            
            
        });
            
    }
  }


