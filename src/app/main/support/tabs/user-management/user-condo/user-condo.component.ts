import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';

import { Router, ActivatedRoute } from '@angular/router';
import { City } from 'app/main/profile/tabs/models/city.model';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { AppService } from 'app/main/services/app.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { APIResponse, AppDateFormat, AlertType, AppLiterals, ClientUserRole, UserRole, UserEnrollmentStatus, SearchBarPageIndex, UserType } from 'app/utils/app-constants';
import * as moment from 'moment';
import { User } from 'app/main/account/models/user.model';
import { AuthenticationService } from 'app/_services';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { MenuService } from 'app/layout/components/toolbar/menu.service';

export interface DialogData {
    userData: User;
    isEditUser: Boolean;
    isMultipleAdminAvailable: Boolean;
    orgId: string;
    userId: string;
    isAdmin: boolean;
    currentUser: any;
}


@Component({
    selector: 'user-condo',
    templateUrl: './user-condo.component.html',
    styleUrls: ['./user-condo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class UserCondoComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any>;

    condoSearchType = 1;

    condoUserform: FormGroup;
    condoList = [];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    condoCtrl = new FormControl();
    selectedCondos: any[] = [];
    filteredCondos: Observable<any[]>;

    userDetails: User[];
    isInputDisabled = false;

    currentUser: any;
    selectedOrganization: any;

    @ViewChild('condoInput', { static: false }) condoInput: ElementRef<HTMLInputElement>;

    constructor(
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        public dialog: MatDialog,
        private _authService: AuthenticationService,
        private _menuService: MenuService
    ) {

        debugger;
        this._unsubscribeAll = new Subject();
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

        this.condoUserform = this._formBuilder.group({
            condos: [''],
            cityChips: ['']
        });

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.getAllCondoList();
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


    confimUserDelete(user) {
        this._appService.deleteClientUser(user, this.selectedOrganization.clientOrganisationId, this.currentUser.id).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.userDeleteSuccessful);
                this.getClientAccountInfo(this.selectedOrganization.clientOrganisationId)
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeleteTheClientUser);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    openNewUserDialog() {
        var shouldAddAdmin = true;
        if (this.userDetails != null && this.userDetails.length > 0) {
            shouldAddAdmin = false;
        }

        const userNewRef = this.dialog.open(UserManagementDialog, { data: { isEditUser: false, orgId: this.selectedOrganization.clientOrganisationId, isAdmin: shouldAddAdmin, currentUser: this.currentUser }, width: '500px' });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getClientAccountInfo(this.selectedOrganization.clientOrganisationId);
            }
        });
    }

    openEditUserDialog(data: number) {
        let filterUser = this.userDetails.find(x => x.clientId == data);

        let adminUsers = this.userDetails.filter(user => user.userRole == 1);
        let multipleAdminAvailable = false;

        if (adminUsers.length > 1) {
            multipleAdminAvailable = true;
        }

        const userEditRef = this.dialog.open(UserManagementDialog, {
            data: { isEditUser: true, userData: filterUser, orgId: this.selectedOrganization.clientOrganisationId, isMultipleAdminAvailable: multipleAdminAvailable, currentUser: this.currentUser }, width: '500px'
        });

        userEditRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getClientAccountInfo(this.selectedOrganization.clientOrganisationId);
            }
        });
        this.userDetails = [...this.userDetails];
    }


    getAllCondoList() {
        this._appService.getAppClientOrgList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.condoList = response.clientOrganisations;
                this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
                this.filteredCondos = this.condoCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: City | null) => data ? this._condoFilter(data) : this.condoList.slice()));
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadCondoListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    //**************  Condo Filter Starts *********************/
    private _condoFilter(value): any[] {
        let return_value: any;
        if (this.condoList.includes(value)) {
            if (this.condoSearchType == 1) {
                return_value = this.condoList.filter((condo: any) => condo.organisationName.toLowerCase().indexOf(value) !== -1);
            } else {
                return_value = this.condoList.filter((condo: any) => condo.corporateNumber.toLowerCase().indexOf(value) !== -1);
            }
            this.selectedCondoHandle(value);
        } else {
            const filterValue = value.toLowerCase();
            if (this.condoSearchType == 1) {
                return_value = this.condoList.filter((condo: any) => condo.organisationName.toLowerCase().indexOf(filterValue) !== -1);
            } else {
                return_value = this.condoList.filter((condo: any) => condo.corporateNumber.toLowerCase().indexOf(filterValue) !== -1);
                // return_value = this.condoList.filter((condo: any) => condo.corporateNumber.toLowerCase().indexOf(value) !== -1);
            }
        }
        return return_value;
    }

    private selectedCondoHandle(value: any) {
        let index = this.condoList.indexOf(value)
        this.condoList.splice(index, 1);
        this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
        this.condoUserform.get('condos').setValue(this.selectedCondos);
        this.condoInput.nativeElement.blur();
        this.condoInput.nativeElement.focus();
    }

    removeCondo(data: any): void {
        const index = this.selectedCondos.indexOf(data);
        if (index >= 0) {
            this.isInputDisabled = false;
            this.selectedCondos.splice(index, 1);
            this.condoList.push(data);
            this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
            this.condoCtrl.setValue(null);
            this.condoUserform.get('condos').setValue(this.selectedCondos);
            this.userDetails = [];
        }
    }

    selectCondo(event: MatAutocompleteSelectedEvent): void {
        this.isInputDisabled = true;
        this.selectedCondos.push(event.option.value);
        this.condoInput.nativeElement.value = '';
        this.condoCtrl.setValue(null);
        this.condoInput.nativeElement.blur();
        this.condoInput.nativeElement.focus();
        this.selectedOrganization = event.option.value;
        this.getClientAccountInfo(this.selectedOrganization.clientOrganisationId);
    }

    //**************** Condo filter ends  *********************/

    getClientAccountInfo(clientOrgId) {
        this._appService.getClientAccountDetailsForSupportUser(clientOrgId).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                if (response.users != null && response.users.length > 0) {
                    response.users.forEach(user => {
                        if (Number(user.clientUserType) == ClientUserRole.Manager) {
                            user.userTypeDisplayText = 'Manager';
                        } else if (Number(user.clientUserType) == ClientUserRole.BoardMember) {
                            user.userTypeDisplayText = 'Board Member';
                        } else if (Number(user.clientUserType) == ClientUserRole.AssistantManager) {
                            user.userTypeDisplayText = 'Assistant Manager';
                        }
                    });
                }
                this.userDetails = response.users;
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.UserListEmpty);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    searchTypeChanged(searchType) {
        if (this.selectedCondos.length > 0) {
            this.condoList.push(this.selectedCondos[0]);
            this.selectedCondos.splice(0, 1);
        }
        this.isInputDisabled = false;
        this.condoSearchType = searchType;
        if (searchType == 1) {
            this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
        } else if (searchType == 2) {
            this.condoList.sort((a, b) => a.corporateNumber.localeCompare(b.corporateNumber));
        }
        this.userDetails = [];
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


@Component({
    selector: 'user-management-dialog',
    templateUrl: 'user-management-dialog.html',
})

export class UserManagementDialog {

    clientOrganisationId: string;
    userForm: FormGroup;
    mandatory = "Mandatory field is required";
    dialogType: number;

    userData = {};
    existingUserData: any;
    isAdminSelected = false;
    currentUser: any;

    shouldAllowAdminEdit: Boolean = false;

    constructor(
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UserManagementDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {

        this.currentUser = this.data.currentUser;

        if (this.data.isEditUser != true) {
            this.clientOrganisationId = this.data.orgId;
            this.dialogType = 1;
            this.isAdminSelected = this.data.isAdmin;

            this.userForm = this._formBuilder.group({
                firstName: [''],
                lastName: [''],
                email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
                role: ['', Validators.required],
                adminRights: [this.isAdminSelected]
            });
        } else {
            this.dialogType = 2;
            let editData = this.data.userData;
            this.clientOrganisationId = this.data.orgId;
            this.existingUserData = editData;

            let userType = '';

            if (editData.clientUserType == ClientUserRole.Manager) {
                userType = 'Manager';
            } else if (editData.clientUserType == ClientUserRole.BoardMember) {
                userType = 'Board Member';
            } else if (editData.clientUserType == ClientUserRole.AssistantManager) {
                userType = 'Assistant Manager';
            }

            if (editData.userRole == 1) {
                this.isAdminSelected = true;
                this.shouldAllowAdminEdit = !(this.data.isMultipleAdminAvailable);
            } else {
                this.isAdminSelected = false;
            }

            this.userForm = this._formBuilder.group({
                firstName: [editData.firstName],
                lastName: [editData.lastName],
                email: [{ value: editData.email, disabled: true }, Validators.required],
                role: [userType, Validators.required],
                adminRights: [this.isAdminSelected]
            });
        }
    }

    submitUserData() {
        this.userData['firstName'] = '';
        this.userData['lastName'] = '';

        if (this.userForm.value['role'] == 'Manager') {
            this.userData['clientUserType'] = ClientUserRole.Manager;
        } else if (this.userForm.value['role'] == 'Board Member') {
            this.userData['clientUserType'] = ClientUserRole.BoardMember;
        } else {
            this.userData['clientUserType'] = ClientUserRole.AssistantManager;
        }

        if (this.isAdminSelected == true) {
            this.userData['userRole'] = UserRole.Admin
        } else {
            this.userData['userRole'] = UserRole.NormalUser
        }
        this.userData['organisationId'] = this.clientOrganisationId;
        if (this.dialogType == 1) {
            this.userData['email'] = this.userForm.value['email'].toLowerCase();
            this._appService.inviteNewClientUser(this.userData).subscribe((response) => {
                if (response.statusCode == APIResponse.Success) {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.newUserInvitedSuccessfully);
                    this.dialogRef.close(this.userData)
                } else if (response.statusCode == UserEnrollmentStatus.AlreadyExist) {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.vendorAccountExistAlready);
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToInviteClientProfile);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        } else {
            let formValue = this.userForm.value;
            this.userData['firstName'] = formValue.firstName;
            this.userData['lastName'] = formValue.lastName;
            this.userData['email'] = this.existingUserData.email.toLowerCase()
            this.userData['userId'] = this.existingUserData.clientId;
            this.userData['organisationId'] = this.clientOrganisationId;
            this.userData['userType'] = UserType.Client;
            this.userData['supportUserId'] = this.currentUser.id;

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

    editCorporation() {
        console.log(this.userForm.value);
    }
}