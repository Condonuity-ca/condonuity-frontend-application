import { Component, OnDestroy, OnInit, ViewEncapsulation,ElementRef, ViewChild,Inject } from '@angular/core';
import { Subject,Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators,FormControl,FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog,MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
export interface DialogData {
  
}


@Component({
    selector     : 'tab',
    templateUrl  : './tab.component.html',
    styleUrls    : ['./tab.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})


export class TabComponent implements OnInit, OnDestroy {
    about: any;
    selectedTabIndex = 0;
    
    constructor(
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
    ) {
       

    }
   
    changeTab(event) {
        this.selectedTabIndex = event.index;
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
       
    }
}