import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { User } from 'app/main/account/models/user.model';
import { BillingInfo } from 'app/main/account/models/billing-info.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppService } from '../../../services/app.service';
import { APIResponse, AppLiterals, AlertType } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { takeUntil } from 'rxjs/operators';
import { ClientUserRole, UserRole } from '../../../../utils/app-constants';
import { AuthenticationService } from '../../../../_services/authentication.service';

export interface DialogData {
  billingData: BillingInfo;
  userData: User;
  isEditUser: Boolean;
  isMultipleAdminAvailable: Boolean;
  orgId: string;
  userId: string;
  clientUserId: string;
}

export enum UserAccountStatus {
  invited = 0,
  active = 1,
  inActive = 2
}



@Component({
  selector: 'client-account',
  templateUrl: './client-account.component.html',
  styleUrls: ['./client-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ClientAccountComponent implements OnInit, OnDestroy {
  about: any;
  // clientOrganisationId: string;
  // clientId: string;
  approvalForm: FormGroup;
  userDetails: User[];
  billInfo: BillingInfo;
  userApproval = { publish: false, award: false, vendor: false };
  currentUser: any;

  currentUserRole = 2;
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _authService: AuthenticationService
  ) {
    this._unsubscribeAll = new Subject();
  }

  approveNos($event: any, type) {
    if (type == 'publish') {
      ($event.value == 1) ? (this.userApproval.publish = true) : (this.userApproval.publish = false);
    } else if (type == 'vendor') {
      ($event.value == 1) ? (this.userApproval.vendor = true) : (this.userApproval.vendor = false);
    } else if (type == 'award') {
      ($event.value == 1) ? (this.userApproval.award = true) : (this.userApproval.award = false);
    }
  }


  openDeleteConfirmationDialog(user) {
    const userNewRef = this.dialog.open(DeleteConfirmationDialog, { data: { userId: user, orgId: this.currentUser.currentOrgId, clientUserId: this.currentUser.clientId } });
    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.userDetails = this.userDetails.filter(h => h.clientId !== result)
      }
    });
  }

  openNewUserDialog() {
    const userNewRef = this.dialog.open(UserManagementDialog, { data: { isEditUser: false, orgId: this.currentUser.currentOrgId, userId: this.currentUser.clientId }, width: '500px', height: 'auto' });
    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getClientAccountInfo(this.currentUser.currentOrgId, this.currentUser.clientId)
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
      data: { isEditUser: true, userData: filterUser, orgId: this.currentUser.currentOrgId, userId: this.currentUser.clientId, isMultipleAdminAvailable: multipleAdminAvailable }, width: '500px'
    });


    userEditRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        let selectedItem = this.userDetails.find(x => x.clientId == result.clientUserId)
        selectedItem.lastName = result.lastName;
        selectedItem.firstName = result.firstName;
        selectedItem.userRole = result.userRole;
        selectedItem.clientUserType = result.clientUserType;
      }
    });

    this.userDetails = [...this.userDetails];
  }

  // removeUser(id:number) {
  //   let index = this.userDetails.indexOf(this.userDetails.find(x => x.clientId == id));
  //   this.userDetails.splice(index,1);
  //   console.log(index);
  // }

  submitApproval() {
    console.log(this.approvalForm.value);
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    this.approvalForm = this._formBuilder.group({
      publishProject: this._formBuilder.group({
        publish: ['', Validators.required],
        publishApproval: ['']
      }),
      vendorReview: this._formBuilder.group({
        review: ['', Validators.required],
        reviewApproval: ['']
      }),
      projectAward: this._formBuilder.group({
        award: ['', Validators.required],
        awardApproval: ['']
      })
    });


    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
      this.getClientAccountInfo(this.currentUser.currentOrgId, this.currentUser.clientId)
    });

    this.billInfo = { billingDetails: { street: 'Manhatten', city: 'NY', province: 'CA', postalCode: '2452' }, paymentDetails: { cardName: 'xi', cardNumber: '5645645564564', expiryDate: '10/10/2019', securityCode: '622' } };
  }



  getClientAccountInfo(clientOrgId, clientUserId) {
    this._appService.getClientAccountDetails(clientOrgId, clientUserId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.currentUserRole = response.userRole;
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
        //Show error message
      }
    }, err => {
      console.log(err);
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
  selector: 'user-management-dialog',
  templateUrl: 'user-management-dialog.html',
})

export class UserManagementDialog {

  clientOrganisationId: string;
  clientUserId: string;
  userForm: FormGroup;
  mandatory = "Mandatory field is required";
  dialogType: number;

  userData = {};
  existingUserData: any;
  isAdminSelected = false;

  shouldAllowAdminEdit: Boolean = false;

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserManagementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.clientOrganisationId = this.data.orgId;
    this.clientUserId = this.data.userId;

    if (this.data.isEditUser != true) {
      this.dialogType = 1;
      this.userForm = this._formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        role: ['', Validators.required],
        adminRights: ['']
      });
    } else {
      this.dialogType = 2;
      let editData = this.data.userData;
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
        ;
        this.isAdminSelected = true;
        this.shouldAllowAdminEdit = !(this.data.isMultipleAdminAvailable);
      } else {
        this.isAdminSelected = false;
      }

      this.userForm = this._formBuilder.group({
        email: [{ value: editData.email, disabled: true }, Validators.required],
        role: [userType, Validators.required],
        adminRights: [this.isAdminSelected]
      });
    }
  }

  submitUserData() {
    this.userData['firstName'] = '';
    this.userData['lastName'] = '';
    this.userData['email'] = this.userForm.value['email'];

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
    this.userData['modifiedByUserId'] = this.clientUserId;

    if (this.dialogType == 1) {
      this._appService.inviteNewClientUser(this.userData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.newUserInvitedSuccessfully);
          this.dialogRef.close(this.userData)
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToInviteClientProfile);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {
      this.userData['email'] = this.existingUserData.email;
      this.userData['clientUserId'] = this.existingUserData.clientId;
      this.userData['clientOrgId'] = this.clientOrganisationId;
      this._appService.updateClientUserDetails(this.userData).subscribe((response) => {
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



@Component({
  selector: 'delete-confirmation-dialog',
  templateUrl: 'delete-confirmation-dialog.html',
})

export class DeleteConfirmationDialog {

  private organizationId: string;
  private userId: string;
  private modifiedByClientUserId: string;

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (this.data != null) {
      this.organizationId = this.data.orgId;
      this.modifiedByClientUserId = this.data.clientUserId;
      this.userId = this.data.userId;
    } else {

    }
  }
  confimUserDelete() {
    debugger;
    this._appService.deleteClientUser(this.userId, this.organizationId, this.modifiedByClientUserId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.userDeleteSuccessful);
        this.dialogRef.close(this.userId)
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeleteTheClientUser);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }
}