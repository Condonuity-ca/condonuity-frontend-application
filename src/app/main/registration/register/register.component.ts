import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserAuthenticationService } from '../../services/user-authentication.service';
import { CommonFunctionsService } from '../../../_services/common-functions.service';
import { AppUtilService } from '../../../utils/app-util.service'
import { AlertType, APIResponse, UserType } from 'app/utils/app-enum';
import { AppLiterals } from 'app/utils/app-literals';
import { AppService } from 'app/main/services/app.service';
import { DialogType, ConfirmationDialogComponent } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';

export enum EmailVerificationStatus {
    EmailExistAlready = 6,
    UserEmailBlocked = 12,
    ClientAccountExists = 13,
    VendorAccountExists = 14
}

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _appService: AppService,
        private _fuseConfigService: FuseConfigService,
        private _appUtil: AppUtilService,
        private _formBuilder: FormBuilder,
        private router: Router,
        private _cookieService: CookieService,
        private _userAuth: UserAuthenticationService,
        private _commonFunctionsService: CommonFunctionsService,
        private _appUtilService: AppUtilService,
        public dialog: MatDialog

    ) {
        // Configure the layout
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

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }


    onSubmit() {
        let userType = this.registerForm.value['userType'];
        if (userType == 'condo') {
            this._userAuth.checkClientMail(this.registerForm.value['email']).subscribe(response => {
                this.userVerification(response)
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        } else if (userType == 'contractor') {
            this._userAuth.checkVendorMail(this.registerForm.value['email']).subscribe(response => {
                this.userVerification(response)
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        }
    }


    userVerification(response) {
        if (response.statusCode == APIResponse.Success) {
            this.userCreationHandler(response)
        } else if (response.statusCode == EmailVerificationStatus.EmailExistAlready) {
            const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '550px', data: {
                    type: DialogType.OneButtonDialog,
                    title: "EMAIL EXISTS ALREADY",
                    message: AppLiterals.emailEnrolledAlready,
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
        } else if (response.statusCode == EmailVerificationStatus.UserEmailBlocked) {
            this._appUtilService.showAlert(AlertType.Error, AppLiterals.userEmailBlocked)
        } else if (response.statusCode == EmailVerificationStatus.ClientAccountExists) {
            this._appUtilService.showAlert(AlertType.Error, AppLiterals.condoProfileExistAlready)
        } else if (response.statusCode == EmailVerificationStatus.VendorAccountExists) {
            this._appUtilService.showAlert(AlertType.Error, AppLiterals.vendorProfileExistAlready)
        } else {
            this._appUtilService.showAlert(AlertType.Error, AppLiterals.emailExistAlready)
            this.registerForm.controls['email'].setErrors({ 'incorrect': true });
        }
    }

    userCreationHandler(response) {
        console.log(response);
        if (response.statusCode == APIResponse.Success) {
            this._cookieService.set('confirm_mail', JSON.stringify(this.registerForm.value));
            this._cookieService.set('mailType', JSON.stringify('register'));
            this.router.navigate(['/register/mail-confirm/']);
        } else {
            this.registerForm.controls['email'].setErrors({ 'incorrect': true });
        }
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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
            userType: ['', [Validators.required]],
        });
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

