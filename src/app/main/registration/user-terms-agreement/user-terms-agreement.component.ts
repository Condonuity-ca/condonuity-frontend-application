import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { Subject, from } from 'rxjs';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { AppService } from '../../services/app.service';
import { APIResponse, AppLiterals, AlertType, UserType } from '../../../utils/app-constants';
import { AppUtilService } from '../../../utils/app-util.service';
import { RegistrationService } from '../../registration/registration.service';
import { takeUntil } from 'rxjs/internal/operators';



@Component({
    selector: 'user-terms-agreement',
    templateUrl: './user-terms-agreement.component.html',
    styleUrls: ['./user-terms-agreement.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class UserTermsAgreementComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    private hash: string;
    private userType;
    public userEmail: string;

    agreeTerms: boolean = false;
    agreePrivacy: boolean = false;
    validUser: boolean = true;
    existingUser: boolean = false;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private activeRoute: ActivatedRoute,
        private _cookieService: CookieService,
        private _registrationService: RegistrationService,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private router: Router
    ) {
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

        this._unsubscribeAll = new Subject();

        this.activeRoute.queryParams.subscribe(params => {
            this.userEmail = params['email'];
            this.hash = params['hash'];
            this.userType = params['userType'];
            if (this.hash != null && this.hash != '') {
                this.hash = decodeURI(this.hash);
                let userData = { 'email': this.userEmail, 'hash': this.hash, 'isUserRegistrationRequired': false, 'userType': this.userType }
                this._registrationService.currentCorporationSubject.next(userData)
                this.validateRegistrationLink();
            }
        });

        this._registrationService.userData.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.userEmail = userData.email;
            this.hash = userData.hash;
            this.userType = userData.userType;
            this.validUser = true;
        });

    }


    validateRegistrationLink() {
        this._appService.validteUserInviteLinkURL(this.hash).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.validUser = true;
                if (this.userType == UserType.Client && response.isPasswordRequired == false) {
                    this.existingUser = true;
                    this.acceptExistingClientInvite();
                }
            } else {
                this.validUser = false;
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    acceptExistingClientInvite() {
        this._appService.accpetClientInvitation(this.hash).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.inviteAcceptedSuccessfully);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    termsAgree(flag) {
        this.agreeTerms = flag;
    }

    privacyAgree(flag) {
        this.agreePrivacy = flag;
    }


    acceptInvitation() {
        if (this.userType == UserType.Vendor) {
            this._appService.accpetVendorInvitation(this.hash).subscribe((response) => {
                if (response.statusCode == APIResponse.Success) {
                    this.router.navigate(['/register/create-password/']);
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        } else {
            this._appService.accpetClientInvitation(this.hash).subscribe((response) => {
                if (response.statusCode == APIResponse.Success) {
                    this.router.navigate(['/register/create-password/']);
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
        }
    }

    clearRegisterData() {
        this._cookieService.deleteAll();
        localStorage.clear();
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
