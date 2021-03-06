import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../models/item.model'
import { ProjectPostingService } from './project-posting/services/project-posting.service';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'app/main/services/app.service';
import { APIResponse } from 'app/utils/app-constants';
import { AuthenticationService } from 'app/_services/authentication.service';
@Component({
    selector: 'project-view',
    templateUrl: './project-view.component.html',
    styleUrls: ['./project-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProjectViewComponent implements OnInit, OnDestroy {
    projectForm: FormGroup;
    about: any;
    itemDetailsList: Item[] = [];

    selectedTabIndex = 0;
    selectedBidData: any;

    isProjectActive = false;
    currentUser: any;
    currentProject: any;

    shouldLogBidView = true;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ProfileService} _profileService
     */
    constructor(
        private _authService: AuthenticationService,
        private _appService: AppService,
        public dialog: MatDialog,
        private _projPostService: ProjectPostingService

    ) {
        this._unsubscribeAll = new Subject();
        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.currentUser = userData;
        });
        this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            data => {
                if (data != null) {
                    this.currentProject = data.project;
                    if (data.isProjectOpen != null && data.isProjectOpen == true) {
                        this.isProjectActive = true;
                    }
                }
            });
    }


    changeTab(event) {
        this.selectedTabIndex = event.index;
        if (this.selectedTabIndex == 1 && this.shouldLogBidView) {
            this.postBidResultViewLog();
        }
    }

    bidSelected(bidData) {
        if (bidData != null) {
            this.selectedBidData = bidData;
            this.selectedTabIndex = 2;
        }
    }

    postBidResultViewLog() {
        debugger;
        this.shouldLogBidView = false;
        var bidViewLog = {
            "clientId": this.currentUser.clientId,
            "projectId": this.currentProject.projectId
        }
        this._appService.postClientBidViewLog(bidViewLog).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                console.log("Success");
            }
        }, err => {
            //Some error
        });
    }

    /**
     * On init
     */
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

