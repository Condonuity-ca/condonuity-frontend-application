import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
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
import { NewCondo } from './model/new-condo.model';
import { NewVendor } from './model/new-vendor.model';


export interface DialogData {
    userData;
}

@Component({
    selector: 'new-registration',
    templateUrl: './new-registration.component.html',
    styleUrls: ['./new-registration.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class NewRegistrationComponent implements OnInit, OnDestroy {

    @Input() viewOnly: boolean;

    selectedTabIndex = 0;
    clientOrganizationId: string;
    userForm: FormGroup;

    public newCondoList: NewCondo[] = [];
    public newVendorList: NewVendor[] = [];

    isDataReady = false;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,

        private _authService: AuthenticationService,
        private _condoBrowserService: CondoBrowserService,
        private _menuService: MenuService,
        private _appUtil: AppUtilService
    ) {
        this._unsubscribeAll = new Subject();
    }



    openClientDetailDialog() {
        const ClientDetailDialogRef = this.dialog.open(ClientDetailDialog, { width: '60%', height: 'auto' });
        ClientDetailDialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {

            }
        });
    }

    openVendorDetailDialog() {
        const VendorDetailDialogRef = this.dialog.open(VendorDetailDialog, { width: '60%', height: 'auto' });
        VendorDetailDialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {

            }
        });
    }


    changeTab(event) {
        this.selectedTabIndex = event.index;
    }


    /**
     * On init
     */
    ngOnInit(): void {
        this.getUnapprovedOrgList();
    }



    getUnapprovedOrgList() {
        this._appService.getUnapprovedOrgList().subscribe(response => {
            debugger;
            if (response.statusCode == APIResponse.Success) {
                this.newCondoList = response.results.clientOrganisations;
                this.newVendorList = response.results.vendorOrganisations;
                this.isDataReady = true;
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}




@Component({
    selector: 'client-detail-dialog',
    templateUrl: 'client-detail-dialog.html',
    animations: fuseAnimations

})
export class ClientDetailDialog {
    spot = { ug: true, gl: true };
    clientDetailform: FormGroup;
    profileData;
    constructor(
        private _formBuilder: FormBuilder
    ) {
        this.clientDetailform = this._formBuilder.group({
            to: ['', Validators.required],
            subject: ['', Validators.required],
            description: ['', Validators.required]
        });
    }
}


@Component({
    selector: 'vendor-detail-dialog',
    templateUrl: 'vendor-detail-dialog.html',
    animations: fuseAnimations

})
export class VendorDetailDialog {
    spot = { ug: true, gl: true };
    vendorDetailform: FormGroup;
    profileData;
    constructor(
        private _formBuilder: FormBuilder
    ) {
        this.vendorDetailform = this._formBuilder.group({
            to: ['', Validators.required],
            subject: ['', Validators.required],
            description: ['', Validators.required]
        });
    }
}


