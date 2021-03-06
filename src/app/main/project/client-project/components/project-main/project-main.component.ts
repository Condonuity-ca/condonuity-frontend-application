import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { AuthenticationService } from 'app/_services/authentication.service'
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { CreateProjectComponent } from '../create-project/create-project.component';

@Component({
    selector: 'project-main',
    templateUrl: './project-main.component.html',
    styleUrls: ['./project-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProjectMainComponent implements OnInit, OnDestroy {

    @ViewChild(CreateProjectComponent, { static: false }) createProjectChildComp;

    registerForm: FormGroup;
    uploadedFiles = [];
    userType: number;

    selectedTabIndex = 1;
    isNewProjectCreated;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _authService: AuthenticationService,
    ) {
        this._unsubscribeAll = new Subject();
    }



    getMessage(isNewProjectCreated) {
        if (isNewProjectCreated) {
            this.selectedTabIndex = 1;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
    }

    changeTab(event) {
        this.selectedTabIndex = event.index;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
