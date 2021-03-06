import { Component, OnInit, ViewEncapsulation, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AuthenticationService } from 'app/_services/authentication.service';
import { first } from 'rxjs/operators';
import { FuseNavigationService } from '@condonuity/components/navigation/navigation.service';
import { UserAuthenticationService } from '../../services/user-authentication.service';
import { navigationclient } from 'app/navigation/navigationclient';
import { navigationVendor } from 'app/navigation/navigationVendor';
import { navigationSupportUser } from 'app/navigation/navigationSupportUser';
import { CommonFunctionsService } from 'app/_services/common-functions.service';
import { UserType, APIResponse, AppLiterals, AlertType, LoginResponse } from '../../../utils/app-constants';
import { AppUtilService } from '../../../utils/app-util.service';
import { ConfirmationDialogComponent, DialogType } from '../../Shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppStateService } from 'app/main/services/app-state.service';
import { AppService } from 'app/main/services/app.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';



@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    validEmail: boolean = false;
    returnUrl: string;
    userName: String;
    loading = false;
    loading1 = false;
    isRememberMeSelected = false;
    userNameFromStore = '';
    pwdFromStore = '';
    hide = true;
    isRemberMeEnabled = false;

    save(): void {
        this.loading = true;
    }

    save1(): void {
        this.loading1 = true;
    }
    @ViewChildren('input') vc;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private router: Router,
        private _authService: AuthenticationService,
        private _appService: AppService,
        private _menuService: MenuService,
        private activeRoute: ActivatedRoute,
        private _fuseNavigationService: FuseNavigationService,
        private _userAuth: UserAuthenticationService,
        private _appUtil: AppUtilService,
        public dialog: MatDialog,
        private appStateService: AppStateService
    ) {

        if (this._authService.currentUserValue) {
            this.router.navigate(['/']);
        }

        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: false
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    checkBoxChangeValue(event) {
        this.isRememberMeSelected = event;
    }


    onSubmit() {
        this._userAuth.checkUserMail(this.loginForm.value['email']).subscribe(
            data => this.userVerification(data),
            error => {
                this.loading = false
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
    }


    userVerification(response) {
        this.loading = false;
        if (response.statusCode == APIResponse.Success) {
            this.validEmail = true;
            if (response.username == null || response.username == "null null") {
                this.userName = "Guest User";
            } else {
                this.userName = response.username;
            }

            this.loginForm.addControl('password', this._formBuilder.control('', Validators.required));
            let password = localStorage.getItem('rem');
            if (password != null && password != '') {
                this.loginForm.get('password').setValue(password);
            }
        } else if (response.statusCode == 6) {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.invalidEmailId);
        } else if (response.statusCode == 7) {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.userAccountInactive);
        } else if (response.statusCode == 5) {
            this.resendInvite(response);
        } else if (response.statusCode == 4) {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.invalidEmailId);
        } else {
            this.loginForm.controls['email'].setErrors({ 'incorrect': true });
        }
    }


    resendInvite(response) {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.OneButtonDialog,
                title: "EMAIL EXISTS ALREADY",
                message: AppLiterals.accountRegistrationInComplete,
                yesButtonTitle: "RESEND INVITE",
                noButtonTitle: ""
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result == 'true') {
                if (response.userType == UserType.Client) {
                    this.resendClientOrgRegisterMail(response.userId);
                } else if (response.userType == UserType.Vendor) {
                    this.resendVendorOrgRegisterMail(response.userId);
                }
            }
        });
    }

    resendClientOrgRegisterMail(clientId) {
        let param = {
            "clientId": clientId
        }

        this._appService.resendClientOrgRegisterOrgEmail(param).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.inviteResentSuccessfully);
                this.router.navigate(['/auth/login']);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    resendVendorOrgRegisterMail(userId) {

        let param = {
            "userId": userId
        }

        this._appService.resendVendorOrgRegisterOrgEmail(param).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.inviteResentSuccessfully);
                this.router.navigate(['/auth/login']);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }




    clearEmaildata() {
        this.loginForm.removeControl('password');
        this.validEmail = false;
        this.loading1 = false;
    }

    loginUser() {
        let authData = { username: this.loginForm.value['email'], password: this.loginForm.value['password'] };
        this._authService.login(authData).pipe(first()).subscribe(data => {

            if (data != null && data.statusCode == LoginResponse.Success) {
                this.checkAndStoreRemMeDetails();
                if (data.userDetails.userType == UserType.Client) {
                    this._appService.getClientOrganisationList(data.userDetails.clientId).subscribe(orgData => {
                        if (orgData != null && orgData.statusCode == LoginResponse.Success) {
                            this._authService.corporationSubject.next(orgData.corporateAccounts);
                            this._authService.storeUserOrgList(orgData.corporateAccounts);
                            this._authService.currentCorporationSubject.next(orgData.corporateAccounts[0]);
                            // this._menuService.currentCorporationSubject.next(orgData.corporateAccounts[0]);
                            this.handleLogin(data.userDetails);
                        }
                    });
                } else if (data.userDetails.userType == UserType.Vendor) {
                    this._appService.getVendorOrgProfileDetails(data.userDetails.userId).subscribe(orgDetails => {
                        this._authService.corporationSubject.next(orgDetails.vendor);
                        this._authService.storeUserOrgList(orgDetails.vendor);
                        this.handleLogin(data.userDetails);
                    });
                } else {
                    this.handleLogin(data.userDetails);
                }
            } else if (data != null && data.statusCode == LoginResponse.UserRegistrationInComplete) {
                this.redirectUserToRegistration(data);
            } else if (data != null && data.statusCode == LoginResponse.UserAccountInactive) {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.userAccountInactive);
            } else if (data != null && data.statusCode == LoginResponse.UserAccountUnderReview) {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.accountUnderReview);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.invalidCredentials);
            }
            this.loading = false;
            this.loading1 = false;
        },
            error => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                this.loading = false;
                this.loading1 = false;
            });
    }

    redirectUserToRegistration(userData) {

        this.appStateService.userRegMetaData = userData;
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.OneButtonDialog,
                title: "PLEASE COMPLETE REGISTRATION",
                message: AppLiterals.accountRegistrationInComplete,
                yesButtonTitle: "OK"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (userData.userDetails.userType == UserType.Client) {
                    this.router.navigate(['/register/register-corp/']);
                    // this.router.navigate(['/register/register-corp/',{'userId': userData.clientId, skipLocationChange:true}]);
                } else if (userData.userDetails.userType == UserType.Vendor) {
                    this.router.navigate(['/register/register-vendor/']);
                }
            }
        });
    }

    checkAndStoreRemMeDetails() {
        if (this.isRememberMeSelected) {
            localStorage.setItem('email', this.loginForm.value['email']);
            localStorage.setItem('rem', this.loginForm.value['password']);
        } else {
            localStorage.removeItem("email");
            localStorage.removeItem("rem");
        }
    }


    handleLogin(loginData) {
        if (loginData) {
            let userType = Number(CommonFunctionsService.checkUserType(loginData.userType));
            if (userType == UserType.Client) {
                this._fuseNavigationService.register('main-nav', navigationclient);
                this.router.navigate(['/projects/client']);
            } else if (loginData.userType == UserType.Vendor) {
                this._fuseNavigationService.register('main-nav', navigationVendor);
                this.router.navigate(['/marketplace']);
            } else if (loginData.userType == UserType.SupportUser) {
                this._fuseNavigationService.register('main-nav', navigationSupportUser);
                this.router.navigate(['support/newRegistration']);
            }

            this._fuseNavigationService.setCurrentNavigation('main-nav');
        } else {
            console.log('error');
        }
    }

    prepopulateUserData() {
        let userName = localStorage.getItem('email');

        if (userName != null && userName != '') {
            this.loginForm.get('email').setValue(userName);
            this.isRemberMeEnabled = true;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        });
        this.returnUrl = this.activeRoute.snapshot.queryParams['returnUrl'] || '/';
        this.prepopulateUserData()
    }

    ngAfterViewInit() {
        this.vc.first.nativeElement.focus();
    }
}

