import { Component, OnDestroy, OnInit, ViewEncapsulation,ElementRef, ViewChild,Inject } from '@angular/core';
import { Subject,Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators,FormControl,FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import {MatDialog,MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ActivatedRoute } from "@angular/router";

@Component({
    selector     : 'edit-project',
    templateUrl  : './edit-project.component.html',
    styleUrls    : ['./edit-project.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class EditProjectComponent implements OnInit, OnDestroy
{
    about: any;
    projectInfo;
    projectId;

    // Private
    private _unsubscribeAll: Subject<any>;
  
    /**
     * Constructor
     *
     */
    constructor(
        // private _profileService: ProfileService
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private activeRoute: ActivatedRoute,

    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.activeRoute.params.subscribe(params => this.projectId=atob(params.id));

    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.projectInfo={projectId:'0001',status:'Un-published',projectName:'Paint Wall',tagWords:['Paint','Contract','Renovation'],bidEndDate:'10/12/2019',projectStartDate:'15/08/2019',projCompletionDate:'01/11/2019',estimatedBudget:'$20000',
    contratType:'Fixed Cost',itemDetails:[{itemDescription:'DryWall',quantity:'1000',unit:'sq ft'},{itemDescription:'Paint',quantity:'1000',unit:'sq ft'}],description:"Due to Problem with renovation Work",
    specConditions:'None',supportingDocs:[],supportingImages:['Image1.Jpg','Image2.png'],insuranceConfirmation:true}
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

