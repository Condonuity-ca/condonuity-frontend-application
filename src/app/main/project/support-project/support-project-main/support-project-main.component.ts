import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { AuthenticationService } from 'app/_services/authentication.service'
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';

@Component({
    selector     : 'support-project-main',
    templateUrl  : './support-project-main.component.html',
    styleUrls    : ['./support-project-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SupportProjectMainComponent implements OnInit, OnDestroy
{
    registerForm: FormGroup;
    uploadedFiles=[];
    userType :number;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _authService :AuthenticationService,
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
