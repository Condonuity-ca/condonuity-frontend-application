import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';

import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, AlertType, AppLiterals } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service'
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { CondoBrowserService } from '../../../condo-browser/condo-browser.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { Aminity } from '../models/aminity.model';

export interface DialogData {
    userData;
}

@Component({
    selector: 'contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ContactUsComponent implements OnInit, OnDestroy {

    @Input() viewOnly: boolean;

    clientOrganizationId: string;
    about: any;
    aminityForm: FormGroup;
    spot = { ug: true, gl: true };
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {AppService} _appService
     */
    constructor(
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _authService: AuthenticationService,
        private _condoBrowserService: CondoBrowserService,
        private _menuService: MenuService,
        private _appUtil: AppUtilService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    poolStatus($event) {
        if (!$event.checked) {
            this.aminityForm.get('poolDetails').disable();
            console.log(this.aminityForm.get('poolDetails'))
        } else {
            this.aminityForm.get('poolDetails').enable();
        }
    }

    parkingStatus($event) {
        if (!$event.checked) {
            this.aminityForm.get('parkingDetails').disable();
            console.log(this.aminityForm.get('poolDetails'))
        }
        else {
            this.aminityForm.get('parkingDetails').enable();
        }
    }


    assignSpots($event, level) {
        if (level == 'Ground' && $event.checked) {
            this.spot.gl = false;
        }
        else if (level == 'Ground' && !$event.checked) {
            this.spot.gl = true;
        }
        else if (level == 'Underground' && $event.checked) {
            this.spot.ug = false;
        }
        else if (level == 'Underground' && !$event.checked) {
            this.spot.ug = true;
        }

    }

    submitAminity() {
        console.log(this.aminityForm.value);
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
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}






