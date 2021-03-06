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
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';

@Component({
    selector     : 'support-project-view',
    templateUrl  : './support-project-view.component.html',
    styleUrls    : ['./support-project-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SupportProjectViewComponent implements OnInit, OnDestroy
{
  projectForm: FormGroup;
    about: any;
    itemDetailsList=[];

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
        private _projPostService : ProjectPostingService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this._projPostService.bidEvent.subscribe(
            eventData => { 
                if(eventData)
                {
                    this.bidStatus = eventData;
                    // this.changeBidEvent(eventData);
                }
                else{
                    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        data => {
                            if(data)
                            {
                            this.bidStatus = data.projectStatus
                        }
                        }
                    )
                }        
             }
        )


    }

    bidStatus:number =0;


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

