import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, AlertType, AppLiterals, UserType, ClientUserRole, AppDateFormat } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service'
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { CondoBrowserService } from '../../../condo-browser/condo-browser.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { Aminity } from '../models/aminity.model';
import * as moment from 'moment';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';


export interface DialogData {
    userData;
    currentUser;
    selectedUser;
}

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class UsersComponent implements OnInit, OnDestroy {

    @Input() viewOnly: boolean;
    currentUser: any;
    filterForm: FormGroup;
    userList = [];
    selectedUserType = 0;

    clientUserList: any[] = [];
    vendorUserList: any[] = [];


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

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            this.currentUser = user;
        });
    }

    viewUser(event) {
        if (event.type == 'click') {
            let user = event.row;
            const UserDetailDialogRef = this.dialog.open(UserDetailDialog, { data: { selectedUser: user, currentUser: this.currentUser }, width: '700px', height: 'auto' });
            UserDetailDialogRef.afterClosed().subscribe(result => {
                if (result != undefined && result != '') {

                }
            });
        }
    }


    // openUserDetailDialog() {
    //     const UserDetailDialogRef = this.dialog.open(UserDetailDialog, { width: '800px', height: 'auto' });
    //     UserDetailDialogRef.afterClosed().subscribe(result => {
    //         if (result != undefined && result != '') {

    //         }
    //     });
    // }

    // openClientDetailDialog() {
    //     const ClientDetailDialogRef = this.dialog.open(ClientDetailDialog, { width: '60%', height: 'auto' });
    //     ClientDetailDialogRef.afterClosed().subscribe(result => {
    //         if (result != undefined && result != '') {

    //         }
    //     });
    // }

    // openVendorDetailDialog() {
    //     const VendorDetailDialogRef = this.dialog.open(VendorDetailDialog, { width: '60%', height: 'auto' });
    //     VendorDetailDialogRef.afterClosed().subscribe(result => {
    //         if (result != undefined && result != '') {

    //         }
    //     });
    // }



    accountStatusSelected(status) {

    }


    ngOnInit(): void {
        this.filterForm = this._formBuilder.group({
            email: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
            firstName: [''],
            lastName: [''],
            userType: ['0']
        });
    }

    userType(type) {
        this.selectedUserType = type;
    }

    searchUser() {
        this.userList = [];
        this.clientUserList = [];
        this.vendorUserList = [];


        let userType = '';
        let formValue = this.filterForm.value;

        if (this.selectedUserType != 0) {
            userType = this.selectedUserType.toString();
        }

        let searchDetails = {
            "email": formValue.email,
            "userType": userType,
            "firstName": formValue.firstName,
            "lastName": formValue.lastName,
            "phone": ""
        }

        this._appService.searchUser(searchDetails).subscribe(response => {
            debugger;
            if (response.statusCode == APIResponse.Success) {
                this.clientUserList = response.results.clientUsers;
                this.vendorUserList = response.results.vendorUsers;
                if (Array.isArray(this.clientUserList) && this.clientUserList.length > 0) {
                    this.userList = this.userList.concat(this.clientUserList);

                    this.userList = this.userList.map(user => {
                        if (user.deleteStatus == '1') {
                            user.accountDisplayStatus = 'Active';
                        } else {
                            user.accountDisplayStatus = 'Inactive';
                        }
                        user.userTypeText = 'Client';
                        return user;
                    });
                }

                if (Array.isArray(this.vendorUserList) && this.vendorUserList.length > 0) {
                    this.vendorUserList = this.vendorUserList.map(user => {
                        if (user.deleteStatus == '1') {
                            user.accountDisplayStatus = 'Active';
                        } else {
                            user.accountDisplayStatus = 'Inactive';
                        }
                        user.userTypeText = 'Contractor';
                        return user;
                    });

                    this.userList = this.userList.concat(this.vendorUserList);
                }
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });


    }

    clearForm() {
        this.filterForm.controls['email'].setValue('');
        this.filterForm.controls['firstName'].setValue('');
        this.filterForm.controls['lastName'].setValue('');
        this.filterForm.controls['userType'].setValue('0');

        this.userList = [];
        this.clientUserList = [];
        this.vendorUserList = [];
    }




    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}




// @Component({
//     selector: 'client-detail-dialog',
//     templateUrl: 'client-detail-dialog.html',
//     animations: fuseAnimations

// })
// export class ClientDetailDialog {
//     spot = { ug: true, gl: true };
//     clientDetailform: FormGroup;
//     profileData;
//     constructor(
//         private _formBuilder: FormBuilder
//     ) {
//         this.clientDetailform = this._formBuilder.group({
//             to: ['', Validators.required],
//             subject: ['', Validators.required],
//             description: ['', Validators.required]
//         });
//     }
// }


// @Component({
//     selector: 'vendor-detail-dialog',
//     templateUrl: 'vendor-detail-dialog.html',
//     animations: fuseAnimations

// })
// export class VendorDetailDialog {
//     spot = { ug: true, gl: true };
//     vendorDetailform: FormGroup;
//     profileData;
//     constructor(
//         private _formBuilder: FormBuilder
//     ) {
//         this.vendorDetailform = this._formBuilder.group({
//             to: ['', Validators.required],
//             subject: ['', Validators.required],
//             description: ['', Validators.required]
//         });
//     }
// }



@Component({
    selector: 'user-detail-dialog',
    templateUrl: 'user-detail-dialog.html',
    animations: fuseAnimations
})

export class UserDetailDialog {
    profileData;
    currentUser;
    selectedUser;
    filterForm: FormGroup;
    constructor(
        private _appService: AppService,
        private _appUtil: AppUtilService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<UserDetailDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.currentUser = data.currentUser;
        this.selectedUser = data.selectedUser;

        if (this.selectedUser.userType == UserType.Client) {
            if (this.selectedUser.corporateAccounts != null && this.selectedUser.corporateAccounts.length > 0) {
                this.selectedUser.corporateAccounts = this.selectedUser.corporateAccounts.map(org => {
                    if (Number(org.userRole) == ClientUserRole.Manager) {
                        org.userTypeDisplayText = 'Manager';
                    } else if (Number(org.userRole) == ClientUserRole.BoardMember) {
                        org.userTypeDisplayText = 'Board Member';
                    } else if (Number(org.userRole) == ClientUserRole.AssistantManager) {
                        org.userTypeDisplayText = 'Assistant Manager';
                    }

                    let modifiedDate = moment(org.modifiedDate);
                    let fromDate: string;
                    if (modifiedDate.isValid()) {
                        fromDate = moment(modifiedDate).format(AppDateFormat.DisplayFormat);
                    } else {
                        fromDate = 'NA';
                    }
                    org.userTenure = fromDate + ' - ' + 'Present';
                    return org;
                });
            }
        } else {

            if (this.selectedUser.vendorOrganisation != null) {
                let createdDate = moment.utc(this.selectedUser.vendorOrganisation.createdAt).toDate();
                let fromDate = moment(createdDate).format(AppDateFormat.DisplayFormat);
                this.selectedUser.userTenure = fromDate + ' - ' + 'Present';
            }

        }
    }

    /**************** Support User Functionalities Start ******************/
    confirmationMsg = '';
    updateUserAccountStatus(status) {
        if (status == '1') {
            this.confirmationMsg = AppLiterals.AccountActivateConfirmation;
        } else if (status == '2') {
            this.confirmationMsg = AppLiterals.AccountDeactivateConfirmation;
        }

        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: this.confirmationMsg,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result == 'true') {
                this.confirmAccountStatus(status);
            }
        });
    }


    confirmAccountStatus(status) {
        let userId = '';
        if (this.selectedUser.userType == UserType.Client) {
            userId = this.selectedUser.clientId;
        } else {
            userId = this.selectedUser.userId;
        }

        let updatedUserStatus = {
            "userType": this.selectedUser.userType,
            "userId": userId,
            "activeStatus": status,
            "supportUserId": this.currentUser.id
        }

        this._appService.updateAppUserAccountDetails(updatedUserStatus).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                if (status == '1') {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountActivationSuccessful);
                } else if (status == '2') {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.AccountDeactivationSuccessful);
                }
            } else {
                if (status == '1') {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.AccountActivationFailure);
                } else if (status == '2') {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.AccountDeactivationFailure);
                }
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

}



