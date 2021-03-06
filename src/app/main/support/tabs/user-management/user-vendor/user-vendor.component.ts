import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from 'app/main/services/app.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat, UserRole, UserEnrollmentStatus, UserType, SearchBarPageIndex } from 'app/utils/app-constants';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { isNumber } from 'util';
import { VendorDetails } from 'app/main/account/models/vendor-details.model';
import { User } from 'app/main/account/models/user.model';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { AuthenticationService } from 'app/_services';


export interface DialogData {
    userData: User;
    vendorData: VendorDetails;
    isEditUser: Boolean;
    orgId: string;
    userId: string;
    isAdmin: boolean;
    currentUser: any;
}

@Component({
    selector: 'user-vendor',
    templateUrl: './user-vendor.component.html',
    styleUrls: ['./user-vendor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class UserVendorComponent implements OnInit, OnDestroy {
    // Private
    private _unsubscribeAll: Subject<any>;
    vendorUserDetailform: FormGroup;

    currentUser: any;
    userDetails: VendorDetails[] = [];
    selectedOrganization: any;

    vendorsList = [];
    selectedVendors: any[] = [];
    filteredVendors: Observable<any[]>;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    vendorCtrl = new FormControl();
    isInputDisabled = false;


    @ViewChild('vendorInput', { static: false }) vendorInput: ElementRef<HTMLInputElement>;

    constructor(
        public dialog: MatDialog,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private router: Router,
        private _formBuilder: FormBuilder,
        private _menuService: MenuService,
        private _authService: AuthenticationService
    ) {
        this._unsubscribeAll = new Subject();
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            this.currentUser = user;
        });
    }


    ngOnInit(): void {
        this.vendorUserDetailform = this._formBuilder.group({
            vendors: [],
            cityChips: []
        });
        this.getVendorList();
    }

    openAddUserDialog() {

        var shouldAddAdmin = true;
        if (this.userDetails != null && this.userDetails.length > 0) {
            shouldAddAdmin = false;
        }

        const userNewRef = this.dialog.open(AddUserDialog, { data: { isEditUser: false, orgId: this.selectedOrganization.vendorOrganisationId, isAdmin: shouldAddAdmin, currentUser: this.currentUser }, width: '500px' });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getVendorAccountInfo(this.selectedOrganization.vendorOrganisationId);
            }
        });
    }

    openEditUserDialog(data: number) {
        let filterUser = this.userDetails.find(x => x.userId == data);
        const userEditRef = this.dialog.open(AddUserDialog, {
            data: { isEditUser: true, vendorData: filterUser, orgId: this.selectedOrganization.vendorOrganisationId, currentUser: this.currentUser },
            width: '500px',
        });

        userEditRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getVendorAccountInfo(this.selectedOrganization.vendorOrganisationId);
            }
        });
    }

    openDeleteConfirmationDialog(user) {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: "Are you sure, you want to delete the user?",
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.confimUserDelete(user);
                } else {
                    console.log("No tapped");
                }
            }
        });
    }

    confimUserDelete(userId) {
        this._appService.deleteVendorUser(userId, this.currentUser.id).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.userDeleteSuccessful);
                this.getVendorAccountInfo(this.selectedOrganization.vendorOrganisationId);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeleteTheClientUser);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }



    getVendorList() {
        this._appService.getAppVendorOrgList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.vendorsList = response.vendorOrgs;

                this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
                this.filteredVendors = this.vendorCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: any | null) => data ? this._vendorFilter(data) : this.vendorsList.slice()));
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadVendorListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    //**************  Vendor Filter Starts *********************/
    private _vendorFilter(value): any[] {
        let return_value: any;
        if (this.vendorsList.includes(value)) {
            return_value = this.vendorsList.filter((vendor: any) => vendor.companyName.toLowerCase().indexOf(value) !== -1);
            this.selectedVendorHandle(value);
        } else {
            const filterValue = value.toLowerCase();
            return_value = this.vendorsList.filter((vendor: any) => vendor.companyName.toLowerCase().indexOf(filterValue) !== -1);
        }
        return return_value;
    }

    private selectedVendorHandle(value: any) {
        let index = this.vendorsList.indexOf(value)
        this.vendorsList.splice(index, 1);
        this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
        this.vendorUserDetailform.get('vendors').setValue(this.selectedVendors);
        this.vendorInput.nativeElement.blur();
        this.vendorInput.nativeElement.focus();
    }

    removeVendor(data: any): void {
        const index = this.selectedVendors.indexOf(data);
        if (index >= 0) {
            this.isInputDisabled = false;
            this.selectedVendors.splice(index, 1);
            this.vendorsList.push(data);
            this.vendorsList.sort((a, b) => a.companyName.localeCompare(b.companyName));
            this.vendorCtrl.setValue(null);
            this.vendorUserDetailform.get('vendors').setValue(this.selectedVendors);
            this.userDetails = [];
        }
    }

    selectCondo(event: MatAutocompleteSelectedEvent): void {
        this.isInputDisabled = true;
        this.selectedVendors.push(event.option.value);
        this.vendorInput.nativeElement.value = '';
        this.vendorCtrl.setValue(null);
        this.vendorInput.nativeElement.blur();
        this.vendorInput.nativeElement.focus();
        this.selectedOrganization = event.option.value;
        this.getVendorAccountInfo(this.selectedOrganization.vendorOrganisationId);
    }

    //**************** Vendor filter ends  *********************/


    getVendorAccountInfo(vendorOrgId) {
        this._appService.getVendorOrgAccountDetails(vendorOrgId).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                let userList = response.vendorUsers;
                userList = userList.map(user => {
                    switch (user.userRole) {
                        case UserRole.Admin: {
                            user.role = 'Admin';
                            user.primaryMail = true;
                            user.admin = true;
                            break;
                        }
                        case UserRole.NormalUser: {
                            user.role = 'User';
                            user.primaryMail = false;
                            user.admin = false;
                            break;
                        }
                    }

                    if (user.firstName == null) {
                        user.firstName = 'Test';
                    }

                    if (user.lastName == null) {
                        user.lastName = 'Name';
                    }
                    return user;
                });

                this.userDetails = userList;
            } else {
                //Show error message
            }
        }, err => {
            console.log(err);
        });
    }

    submitVendor() {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

@Component({
    selector: 'add-user-dialog',
    templateUrl: 'add-user-dialog.html',
})
export class AddUserDialog {

    vendorOrganisationId: string;
    userForm: FormGroup;
    mandatory = "Mandatory field is required";
    dialogType: number;

    userData = {};
    isAdminSelected = false;

    shouldAllowAdminEdit: Boolean = false;

    currentUser: any;

    constructor(
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<AddUserDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.vendorOrganisationId = this.data.orgId;
        this.currentUser = this.data.currentUser;

        if (this.data.isEditUser != true) {
            this.dialogType = 1;
            this.isAdminSelected = this.data.isAdmin;
            this.userForm = this._formBuilder.group({
                email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
                adminRights: [this.isAdminSelected]
            });
        } else {
            this.dialogType = 2;
            let editData = this.data.vendorData;
            let userRole = false;

            if (editData.userRole == UserRole.Admin) {
                userRole = true;
            }

            this.userForm = this._formBuilder.group({
                firstName: [editData.firstName, Validators.required],
                lastName: [editData.lastName, Validators.required],
                email: [{ value: editData.email, disabled: true }, Validators.required],
                adminRights: [userRole, Validators.required]
            });
        }
    }

    submitUserData() {
        this.userData['vendorOrganisationId'] = this.vendorOrganisationId;
        this.userData['userType'] = UserType.Vendor;

        if (this.isAdminSelected) {
            this.userData['userRole'] = UserRole.Admin
        } else {
            this.userData['userRole'] = UserRole.NormalUser
        }

        if (this.dialogType == 2) {
            this.userData['firstName'] = this.userForm.value['firstName'];
            this.userData['lastName'] = this.userForm.value['lastName'];
            this.userData['userId'] = this.data.vendorData.userId;
            this.userData['supportUserId'] = this.currentUser.id;
            this.userData['organisationId'] = this.vendorOrganisationId;
            this.userData['email'] = this.data.vendorData.email;
        }


        if (this.dialogType == 1) {
            this.userData['email'] = this.userForm.value['email'].toLowerCase();
            this._appService.inviteNewVendorUser(this.userData).subscribe((response) => {
                if (response.statusCode == APIResponse.Success) {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.newUserInvitedSuccessfully);
                    this.dialogRef.close(this.userForm.value)
                } else if (response.statusCode == UserEnrollmentStatus.AlreadyExist) {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.userAccountExistAlready);
                } else if (response.statusCode == UserEnrollmentStatus.ReachedMaxiumCount) {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.maximumUserCountReached);
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        } else {
            this._appService.updateAppUserDetails(this.userData).subscribe((response) => {
                if (response.statusCode == APIResponse.Success) {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
                    this.dialogRef.close(this.userData)
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        }
    }

    adminCheckboxTriggered(event) {
        this.isAdminSelected = event.checked
    }
}