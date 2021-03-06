import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { BillingInfo } from 'app/main/account/models/billing-info.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VendorDetails } from 'app/main/account/models/vendor-details.model';
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, UserRole, UserEnrollmentStatus, AlertType, AppLiterals, UserType, SearchBarPageIndex } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service';
import { User } from '../../models/user.model';
import { ConfirmationDialogComponent, DialogType } from '../../../Shared/confirmation-dialog/confirmation-dialog.component';
import { UrlResolver } from '@angular/compiler';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { CustomValidators } from 'app/_services/custom-validators.model';
import { UserAccountInfoDialog } from '../user-account/user-account.component';


export interface DialogData {
  billingData: BillingInfo;
  userData: User;
  vendorData: VendorDetails;
  isEditUser: Boolean;
  orgId: string;
  userId: string;
}


@Component({
  selector: 'vendor-account',
  templateUrl: './vendor-account.component.html',
  styleUrls: ['./vendor-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class VendorAccountComponent implements OnInit, OnDestroy {

  about: any;
  approvalProcessForm: FormGroup;
  userDetails: VendorDetails[];
  primaryAccount: VendorDetails;
  secondaryEmails: VendorDetails[];
  vendorOrganisationId = '';
  billInfo: BillingInfo;
  userApproval = { publish: false, award: false, vendor: false };
  currentVendorUser: any;

  private _unsubscribeAll: Subject<any>;

  constructor(
    public dialog: MatDialog,
    private _appUtil: AppUtilService,
    private _authService: AuthenticationService,
    private _appService: AppService,
    private _menuService: MenuService
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
  }


  openAddUserDialog() {
    const userNewRef = this.dialog.open(AddUserDialog, { data: { isEditUser: false, orgId: this.vendorOrganisationId, userId: this.currentVendorUser.userId }, width: '500px' });
    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorAccountInfo(this.vendorOrganisationId);
      }
    });
  }

  openEditUserDialog(data: number) {
    let filterUser = this.userDetails.find(x => x.userId == data);
    const userEditRef = this.dialog.open(AddUserDialog, {
      data: { isEditUser: true, vendorData: filterUser, orgId: this.vendorOrganisationId, userId: this.currentVendorUser.userId },
      width: '500px',
    });

    userEditRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.getVendorAccountInfo(this.vendorOrganisationId);
      }
    });
  }

  openPasswordDialog() {
    this.dialog.open(AccountDetailsDialog, { data: { vendorData: this.currentVendorUser }, width: '400px', height: 'auto' });
  }


  openUserInfoDialog() {
    const userAccountRef = this.dialog.open(UserAccountInfoDialog, { width: '500px', height: 'auto', data: { userData: this.currentVendorUser } });
    userAccountRef.afterClosed().subscribe(result => {
      ;
      if (result) {
        this.currentVendorUser.firstName = result.firstName;
        this.currentVendorUser.lastName = result.lastName;
        this.currentVendorUser.phone = result.phone;

        if (result.profileImageUrl != null) {
          this.currentVendorUser.profileImageUrl = result.profileImageUrl;
        }
        this._authService.currentUserSubject.next(this.currentVendorUser);

        // this.getVendorAccountInfo(this.vendorOrganisationId);
      }
    });
  }

  // removeUser(id: number) {
  //   if (this.userDetails.length > 1) {
  //     let secondary = <FormArray>this.approvalProcessForm.controls.secEmailsGroup as FormArray;
  //     secondary.removeAt(id);
  //     this.userDetails.splice(id + 1);
  //   }
  // }

  // setUserDetails() {
  //   this.primaryAccount = this.userDetails.find(x => x.primaryMail == true);
  //   this.secondaryEmails = this.userDetails.filter(x => x.primaryMail == false);
  // }

  // submitApproval() {
  //   console.log(this.approvalProcessForm.value);
  // }





  ngOnInit(): void {

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentVendorUser = userData;
      if (this.currentVendorUser.phone == null) {
        this.currentVendorUser.phone = '--';
      }
      this.vendorOrganisationId = userData.vendorOrganisationId;
      this.getVendorAccountInfo(this.vendorOrganisationId);
    });

    this.billInfo = { billingDetails: { street: 'Manhatten', city: 'NY', province: 'CA', postalCode: '2452' }, paymentDetails: { cardName: 'xi', cardNumber: '5645645564564', expiryDate: '10/10/2019', securityCode: '622' } };
  }

  getVendorAccountInfo(vendorOrgId) {
    this._appService.getVendorOrgAccountDetails(vendorOrgId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {

        let isPrimary = true;
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

    this._appService.deleteVendorUser(userId, this.currentVendorUser.userId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.userDeleteSuccessful);
        this.getVendorAccountInfo(this.vendorOrganisationId);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToDeleteTheClientUser);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
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
  vendorUserId: string;
  userForm: FormGroup;
  mandatory = "Mandatory field is required";
  dialogType: number;

  userData = {};
  isAdminSelected = false;

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.vendorOrganisationId = this.data.orgId;
    this.vendorUserId = this.data.userId;

    if (this.data.isEditUser != true) {
      this.dialogType = 1;
      this.userForm = this._formBuilder.group({
        email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        adminRights: ['']
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
    // this.userData['firstName'] = this.userForm.value['firstName'];
    // this.userData['lastName'] = this.userForm.value['lastName'];
    this.userData['email'] = this.userForm.value['email'];

    this.userData['vendorOrganisationId'] = this.vendorOrganisationId;
    this.userData['modifiedByUserId'] = this.vendorUserId;
    this.userData['userType'] = UserType.Vendor;

    if (this.isAdminSelected) {
      this.userData['userRole'] = UserRole.Admin
    } else {
      this.userData['userRole'] = UserRole.NormalUser
    }

    if (this.dialogType == 2) {
      this.userData['userId'] = this.data.vendorData.userId
      this.userData['email'] = this.data.vendorData.email
    }
    ;
    if (this.dialogType == 1) {
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
      this._appService.updateVendorUserDetails(this.userData).subscribe((response) => {
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


@Component({
  selector: 'account-details-dialog',
  templateUrl: 'account-details-dialog.html',
})
export class AccountDetailsDialog {

  userForm: FormGroup;
  vendorUser: any;
  hide = true;
  hideconfirm = true;
  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<AccountDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.vendorUser = data.vendorData;
    this.userForm = this._formBuilder.group({
      password: [
        null,
        Validators.compose([
          Validators.required,
          // check whether the entered password has a number
          CustomValidators.patternValidator(/\d/, {
            hasNumber: true
          }),
          // check whether the entered password has upper case letter
          CustomValidators.patternValidator(/[A-Z]/, {
            hasCapitalCase: true
          }),
          // check whether the entered password has a lower case letter
          CustomValidators.patternValidator(/[a-z]/, {
            hasSmallCase: true
          }),
          // check whether the entered password has a special character
          CustomValidators.patternValidator(
            /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            {
              hasSpecialCharacters: true
            }
          ),
          Validators.minLength(8),
          Validators.maxLength(30)
        ])
      ],
      passwordConfirm: ['', [Validators.required, confirmPasswordValidator]],
    });
  }

  submitUserData() {
    let userPasswordDetails = [];
    userPasswordDetails['userId'] = this.vendorUser.userId;
    userPasswordDetails['userType'] = UserType.Vendor;
    userPasswordDetails['password'] = this.userForm.value['password'];
    ;
    this._appService.resetExistingPassword(userPasswordDetails).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.passwordChangeSuccessful);
        this.dialogRef.close(this.userForm.value)
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }
}



// @Component({
//   selector: 'user-account-info-dialog',
//   templateUrl: 'user-account-info-dialog.html',
//   animations: fuseAnimations
// })
// export class UserAccountInfoDialog {

//   profileImageFile: File;
//   profileImageUrl;
//   userForm: FormGroup;
//   userData: any;
//   mandatory = "Mandatory field is required";
//   constructor(
//     private _appService: AppService,
//     private _appUtil: AppUtilService,
//     private _formBuilder: FormBuilder,
//     public dialogRef: MatDialogRef<UserAccountInfoDialog>,
//     public dialog: MatDialog,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData
//   ) {
//     this.userData = this.data.userData;
//     this.profileImageUrl = this.userData.profileImageUrl;
//     let editData = this.data.userData;
//     this.userForm = this._formBuilder.group({
//       firstName: [editData.firstName, Validators.required],
//       lastName: [editData.lastName, Validators.required],
//       phone: [editData.phone, [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]]
//     });
//   }

//   // openPasswordDialog() {

//   //   const userPasswordRef = this.dialog.open(PasswordChangeDialog, { width: '500px', height: 'auto' });
//   //   userPasswordRef.afterClosed().subscribe(result => {
//   //     //Change Password Backend
//   //     if (result) {
//   //       //Updated Snackbar Action
//   //     }
//   //   });
//   // }

//   updateUserDetails() {
//     let updatedUserData = {
//       'firstName': this.userForm.value['firstName'],
//       'lastName': this.userForm.value['lastName'],
//       'phone': this.userForm.value['phone'],
//       'clientId': this.userData.clientId,
//       'countryCode': this.userData.countryCode,
//       'legalName': this.userData.legalName,
//       'city': this.userData.city
//     }
//     this._appService.updateClientDetails(updatedUserData).subscribe((response) => {
//       if (response.statusCode == APIResponse.Success) {
//         if (this.profileImageFile != null) {
//           this.uploadClientProfileImage(updatedUserData);
//         } else {
//           this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
//           this.dialogRef.close(updatedUserData);
//         }
//       } else {
//         this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
//       }
//     }, err => {
//       this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
//     });
//   }

//   fileEvent(files) {
//     if (files[0].size < 2000000) {
//       if (files.length === 0)
//         return;

//       var mimeType = files[0].type;
//       if (mimeType.match(/image\/*/) == null) {
//         return;
//       }

//       var reader = new FileReader();
//       this.profileImageFile = files[0];
//       reader.readAsDataURL(files[0]);
//       reader.onload = (_event) => {
//         this.profileImageUrl = reader.result;
//       }
//     }
//     else {
//       this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError);
//     }
//   }


//   uploadClientProfileImage(updatedUserData) {
//     this._appService.uploadUserProfileImage(this.profileImageFile, this.userData.clientId, this.userData.userType).subscribe((response: any) => {
//       if (response.statusCode == APIResponse.Success) {
//         this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
//         updatedUserData['profileImageUrl'] = this.profileImageUrl;
//         this.dialogRef.close(updatedUserData);
//       } else {
//         this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
//       }
//     }, err => {
//       this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
//       console.log(err);
//     });
//   }

//   editCorporation() {
//     console.log(this.userForm.value);
//   }
// }




@Component({
  selector: 'contact-person-dialog',
  templateUrl: 'contact-person-dialog.html',
})
export class contactPersonDialog {

  contactPerson: FormGroup;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<contactPersonDialog>
  ) {
    this.contactPerson = this._formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      title: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
    });
  }

  editCorporation() {
    console.log(this.contactPerson.value);
  }
}


export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if (!password || !passwordConfirm) {
    return null;
  }

  if (passwordConfirm.value === '') {
    return null;
  }

  if (password.value === passwordConfirm.value) {
    return null;
  }

  return { passwordsNotMatching: true };
};
