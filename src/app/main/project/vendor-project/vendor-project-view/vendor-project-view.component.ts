import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { AuthenticationService } from '../../../../_services/authentication.service';

@Component({
    selector: 'vendor-project-view',
    templateUrl: './vendor-project-view.component.html',
    styleUrls: ['./vendor-project-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})


export class VendorProjectViewComponent implements OnInit, OnDestroy {
    projectForm: FormGroup;
    about: any;
    itemDetailsList = [];
    currentUser: any;
    bidStatus: number = 1;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _authService: AuthenticationService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _projPostService: ProjectPostingService
    ) {
        this._unsubscribeAll = new Subject();
        this._projPostService.bidEvent.subscribe(
            eventData => {
                if (eventData) {
                    this.bidStatus = eventData;
                }
                else {
                    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        data => {
                            if (data) {
                                this.bidStatus = 1;
                            }
                        });
                }
            }
        )
    }


    ngOnInit(): void {
        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.currentUser = userData;
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

