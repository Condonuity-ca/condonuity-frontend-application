import { Component, ViewEncapsulation } from '@angular/core';

import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AppLiterals, AlertType } from 'app/utils/app-constants';
import { AppUtilService } from 'app/utils/app-util.service';
import { RegistrationService } from '../registration.service';

@Component({
    selector: 'client-accept-invite',
    templateUrl: './client-accept-invite.component.html',
    styleUrls: ['./client-accept-invite.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ClientAcceptInviteComponent {

    private hash: string;
    public userEmail: string;
    public userType: string;
    userData: any;

    validUser: boolean = false;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private activeRoute: ActivatedRoute,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private router: Router,
        private _registrationService: RegistrationService
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

        this.activeRoute.queryParams.subscribe(params => {
            this.userEmail = params['email'];
            this.hash = params['hash'];
            this.userType = params['userType'];
            this.hash = decodeURI(this.hash);
            this.userData = { 'email': this.userEmail, 'hash': this.hash, 'isUserRegistrationRequired': false, 'userType': this.userType };
            this.validateRegistrationLink();
        });

        // this.validateRegistrationLink();

    }

    ngOnInit(): void {
    }

    validateRegistrationLink() {
        this._appService.validteUserInviteLinkURL(this.hash).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.validUser = true;
                if (response.isPasswordRequired == true) {
                    this._registrationService.currentCorporationSubject.next(this.userData)
                    this.router.navigate(['/register/accept-invite/']);
                } else {
                    this.acceptClientInvite(response.isPasswordRequired);
                }
            } else {
                this.validUser = false;
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }



    acceptClientInvite(shouldSetPassword) {
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
}
