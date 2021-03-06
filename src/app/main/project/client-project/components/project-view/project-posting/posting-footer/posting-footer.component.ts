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
import { ProjectPostingService } from '../services/project-posting.service'
@Component({
    selector     : 'posting-footer',
    templateUrl  : './posting-footer.component.html',
    styleUrls    : ['./posting-footer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class PostingFooterComponent implements OnInit, OnDestroy
{
    about: any;
    projectInfo;
    selectedProject;

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
        private _projService : ProjectPostingService,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this._projService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            data =>{
                if(data)
                {
                    this.userType =data.userType;
                    this.projStatus = data.projectStatus;
                }
                }
        )

    }

    userType :number=0;
    projStatus:number=0;
    
    bidEvent(event)
    {
        this._projService.setBidEvent(event);
        
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

