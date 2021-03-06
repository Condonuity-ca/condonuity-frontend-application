import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { User } from 'app/main/account/models/user.model';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { ClientUserRole, AppDateFormat, APIResponse, AppLiterals, AlertType, UserType, SearchBarPageIndex, MaxFileSize } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service';
import { AppService } from '../../../services/app.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { CustomValidators } from 'app/_services/custom-validators.model';


export interface DialogData {
  userData: any;
}


@Component({
  selector: 'user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserAccountComponent implements OnInit, OnDestroy {
  about: any;
  approvalForm: FormGroup;
  userDetails: User;

  organizationList: any[] = [];
  currentUser: any;

  profileImageUrl: string;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    private _authService: AuthenticationService,
    public dialog: MatDialog,
    private _menuService: MenuService
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
  }

  openUserInfoDialog() {
    const userAccountRef = this.dialog.open(UserAccountInfoDialog, { width: '500px', height: 'auto', data: { userData: this.currentUser } });
    userAccountRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentUser.firstName = result.firstName;
        this.currentUser.lastName = result.lastName;
        this.currentUser.phone = result.phone;

        if (result.profileImageUrl != null) {
          this.currentUser.profileImageUrl = result.profileImageUrl;
        }
        this._authService.currentUserSubject.next(this.currentUser);
      }
    });
  }

  openPasswordDialog() {
    const userPasswordRef = this.dialog.open(PasswordChangeDialog, { width: '500px', height: 'auto', data: { userData: this.currentUser } });
    userPasswordRef.afterClosed().subscribe(result => {
    });
  }

  openUserCorporationAccountDialog() {
    const userCorporationAccountRef = this.dialog.open(UserCorporationAccountInfoDialog, { width: '50%', height: 'auto' });
  }

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

    this._authService.organisationLists.pipe(takeUntil(this._unsubscribeAll)).subscribe(orgList => {
      let orgs = orgList;

      if (orgs.length > 0) {
        orgs = orgs.map(org => {
          switch (org.clientUserType) {
            case ClientUserRole.AssistantManager: {
              org.userCurrentRole = 'Assistant Manager';
              break;
            }
            case ClientUserRole.BoardMember: {
              org.userCurrentRole = 'Board Member';
              break;
            }
            case ClientUserRole.Manager: {
              org.userCurrentRole = 'Manager';
              break;
            }
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
        })
      }
      this.organizationList = orgs;
    })

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
      this.currentUser = x;
      this.profileImageUrl = this.currentUser.profileImageUrl;
    });
  }

  defaultOrgChanged(org) {
    this.updateClientDefaultOrg(org);
  }


  updateClientDefaultOrg(selectedOrg) {
    ;
    this._appService.updateClientDefaultOrg(selectedOrg.clientOrganisationId, this.currentUser.clientId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
        for (let org of this.organizationList) {
          if (org.clientOrganisationId == selectedOrg.clientOrganisationId) {
            org.isPrimary = 'true';
          } else {
            org.isPrimary = 'false';
          }
          this._authService.setCurrentUserOrg(selectedOrg);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}



@Component({
  selector: 'user-account-info-dialog',
  templateUrl: 'user-account-info-dialog.html',
  animations: fuseAnimations
})
export class UserAccountInfoDialog {

  profileImageFile: File;
  profileImageUrl;
  userForm: FormGroup;
  userData: any;
  mandatory = "Mandatory field is required";

  constructor(
    private _appService: AppService,
    private _appUtil: AppUtilService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserAccountInfoDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.userData = this.data.userData;
    this.profileImageUrl = this.userData.profileImageUrl;
    let editData = this.data.userData;
    this.userForm = this._formBuilder.group({
      firstName: [editData.firstName, Validators.required],
      lastName: [editData.lastName, Validators.required],
      phone: [editData.phone, [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]]
    });
  }

  updateUserDetails() {

    ;

    if (this.userData.userType == UserType.Client) {
      let updatedUserData = {
        'firstName': this.userForm.value['firstName'],
        'lastName': this.userForm.value['lastName'],
        'phone': this.userForm.value['phone'],
        'clientId': this.userData.clientId,
        'countryCode': this.userData.countryCode,
        'legalName': this.userData.legalName,
        'city': this.userData.city
      }

      this._appService.updateClientDetails(updatedUserData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          if (this.profileImageFile != null) {
            this.uploadClientProfileImage(updatedUserData);
          } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
            this.dialogRef.close(updatedUserData);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    } else {

      let updatedUserData = {
        'firstName': this.userForm.value['firstName'],
        'lastName': this.userForm.value['lastName'],
        'phone': this.userForm.value['phone'],
        'userId': this.userData.userId,
      }

      this._appService.updateVendorUserInfo(updatedUserData).subscribe((response) => {
        if (response.statusCode == APIResponse.Success) {
          if (this.profileImageFile != null) {
            this.uploadClientProfileImage(updatedUserData);
          } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
            this.dialogRef.close(updatedUserData);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToUpdateClientProfile);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }

  }


  fileEvent(files) {
    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.TWOMB)) {
      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      var reader = new FileReader();
      this.profileImageFile = files[0];
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.profileImageUrl = reader.result;
      }
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError2MB);
    }
  }




  uploadClientProfileImage(updatedUserData) {

    let userId: number;

    if (this.userData.userType == UserType.Client) {
      userId = this.userData.clientId;
    } else {
      userId = this.userData.userId;
    }

    this._appService.uploadUserProfileImage(this.profileImageFile, userId, this.userData.userType).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.userDetailsUpdateSuccessful);
        updatedUserData['profileImageUrl'] = this.profileImageUrl;
        this.dialogRef.close(updatedUserData);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  editCorporation() {
    console.log(this.userForm.value);
  }
}


@Component({
  selector: 'password-change-dialog',
  templateUrl: 'password-change-dialog.html',
})
export class PasswordChangeDialog {
  userForm: FormGroup;
  userData: any;
  hide = true;
  hideconfirm = true;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _appUtil: AppUtilService,
    public dialogRef: MatDialogRef<PasswordChangeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.userData = this.data.userData;
    this.userForm = this._formBuilder.group({
      password: [
        null,
        Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/\d/, {
            hasNumber: true
          }),
          CustomValidators.patternValidator(/[A-Z]/, {
            hasCapitalCase: true
          }),
          CustomValidators.patternValidator(/[a-z]/, {
            hasSmallCase: true
          }),
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
      passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
    });
  }

  submitUserData() {
    let userPasswordDetails = [];
    userPasswordDetails['userId'] = this.userData.clientId;
    userPasswordDetails['userType'] = UserType.Client;
    userPasswordDetails['password'] = this.userForm.value['password'];
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

  editCorporation() {
    console.log(this.userForm.value);
  }
}


@Component({
  selector: 'user-corporation-account-info-dialog',
  templateUrl: 'user-corporation-account-info-dialog.html',
})

export class UserCorporationAccountInfoDialog {
  userForm: FormGroup;
  constructor(
    private _formBuilder: FormBuilder
  ) {
    this.userForm = this._formBuilder.group({
      password: ['', Validators.required],
      passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
    });
  }

  editCorporation() {
    console.log(this.userForm.value);
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
