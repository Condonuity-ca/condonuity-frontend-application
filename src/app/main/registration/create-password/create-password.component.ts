import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AppService } from '../../services/app.service';
import { APIResponse } from '../../../utils/app-constants';
import { UserType } from '../../../utils/app-enum';
import { CommonFunctionsService } from '../../../_services/common-functions.service';
import { AppLiterals, AlertType } from '../../../utils/app-constants';
import { RegistrationService } from '../../registration/registration.service';
import { AppUtilService } from '../../../utils/app-util.service';
import { CustomValidators } from 'app/_services/custom-validators.model';


@Component({
    selector: 'create-password',
    templateUrl: './create-password.component.html',
    styleUrls: ['./create-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class CreatePasswordComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;
    private hash: string;
    public isNewUser = false;
    hide = true;
    hideconfirm = true;
    public userEmail: string;
    public isRegistrationRequired: boolean;


    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private _cookieService: CookieService,
        private _appService: AppService,
        private _commonService: CommonFunctionsService,
        private _registrationService: RegistrationService,
        private _appUtil: AppUtilService
    ) {
        this._unsubscribeAll = new Subject();

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

        this.route.queryParams.subscribe(params => {
            this.userEmail = params['email'];
            this.hash = params['hash'];
            this.hash = decodeURI(this.hash);
        });

        this._registrationService.userData.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.userEmail = userData.email;
            this.hash = userData.hash;
            this.isRegistrationRequired = userData.isUserRegistrationRequired;
            this.isNewUser = true;
        });


    }


    onSubmit() {
        if (this.registerForm.valid) {
            if (this.userEmail != null && this.hash != null) {
                let formValue = this.registerForm.value;

                var params: any;

                if (this.isNewUser == true) {
                    params = {
                        "hash": this.hash,
                        "password": formValue.password,
                        "firstName": formValue.firstName,
                        "lastName": formValue.lastName,
                        "phone": formValue.phone,
                        "isNewUser": this.isNewUser
                    };
                } else {
                    params = {
                        "hash": this.hash,
                        "password": formValue.password,
                        "isNewUser": this.isNewUser
                    };
                }

                this._appService.setPasswordWithDynamicLink(params).subscribe((res: any) => {
                    if (res.statusCode == APIResponse.Success) {
                        if (this.isNewUser == true) {
                            if (this.isRegistrationRequired == true) {
                                if (res.userType == UserType.Client) {
                                    this.router.navigate(['/register/register-corp/']);
                                } else if (res.userType == UserType.Vendor) {
                                    this.router.navigate(['/register/register-vendor/']);
                                }
                            } else {
                                this._appUtil.showAlert(AlertType.Success, AppLiterals.inviteAcceptedSuccessfully);
                                this.redirectToLoginPage();
                            }
                        } else {
                            this._appUtil.showAlert(AlertType.Success, AppLiterals.passwordChangeSuccessful);
                            this.redirectToLoginPage();
                        }
                    } else {
                        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                    }
                },
                    err => {
                        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                    });
            } else {
                let passwordDetails = {
                    "userId": 1,
                    "userType": 1,
                    "password": this.registerForm.value['password']
                };

                this._appService.resetPassword(passwordDetails).subscribe((res: any) => {
                    if (res.statusCode == APIResponse.Success) {
                        this._appUtil.showAlert(AlertType.Success, AppLiterals.passwordChangeSuccessful);
                        this.redirectToLoginPage();
                    } else {
                        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                    }
                },
                    err => {
                        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                    });
            }
        }
    }

    redirectToLoginPage() {
        this.router.navigate(['/auth/login']);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (this.isNewUser) {
            this.registerForm = this._formBuilder.group({
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                phone: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
                // password: ['', [Validators.required, Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
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
                passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
            });
        } else {
            this.registerForm = this._formBuilder.group({
                // password: ['', [Validators.required, Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
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
                passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
            });
        }

        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
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
