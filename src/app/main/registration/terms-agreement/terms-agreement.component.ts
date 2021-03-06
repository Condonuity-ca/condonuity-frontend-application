import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { ActivatedRoute } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { RegistrationService } from '../../registration/registration.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals } from 'app/utils/app-constants';


@Component({
    selector: 'terms-agreement',
    templateUrl: './terms-agreement.component.html',
    styleUrls: ['./terms-agreement.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class TermsAgreementComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    private hash: string;
    public userEmail: string;

    agreeTerms: boolean = false;
    agreePrivacy: boolean = false;
    validUser: boolean = true;
    userType: string;

    // urlStatus = 0;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _appUtil: AppUtilService,
        private _appService: AppService,
        private _fuseConfigService: FuseConfigService,
        private activeRoute: ActivatedRoute,
        private _cookieService: CookieService,
        private _registrationService: RegistrationService
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

        this._unsubscribeAll = new Subject();

        this.activeRoute.queryParams.subscribe(params => {
            debugger;
            this.userEmail = params['email'];
            this.hash = params['hash'];
            this.hash = decodeURI(this.hash);
            let userData = { 'email': this.userEmail, 'hash': this.hash, 'isUserRegistrationRequired': true }
            this._registrationService.currentCorporationSubject.next(userData)
            this.validateRegistrationLink();
        });
    }

    validateRegistrationLink() {
        this._appService.validateRegistrationLink(this.hash).subscribe((response) => {
            console.log(response);
            if (response.statusCode == APIResponse.Success) {
                this.validUser = true;
            } else {
                this.validUser = false;
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
