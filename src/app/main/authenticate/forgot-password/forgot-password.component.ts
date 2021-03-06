import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app.service';
import { APIResponse } from '../../../utils/app-constants';
import { AppLiterals } from '../../../utils/app-literals';
import { AlertType } from '../../../utils/app-enum';
import { CommonFunctionsService } from '../../../_services/common-functions.service';
import { AppUtilService } from '../../../utils/app-util.service';
import { ConfirmationDialogComponent, DialogType } from '../../Shared/confirmation-dialog/confirmation-dialog.component';

import { from } from 'rxjs';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;
    userEmailId = '';

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _cookieService: CookieService,
        private router: Router,
        private _appService: AppService,
        private _commonFunc: CommonFunctionsService,
        private _appUtil: AppUtilService
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
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.route.params.subscribe(params => {
            this.userEmailId = params['emailId'];
        });
    }

    resetPassword() {
        let userEmailId = this.forgotPasswordForm.get('email').value;
        this._appService.forgotPassword(userEmailId).subscribe((res: any) => {

            if (res.statusCode == APIResponse.Success) {
                // this.showResetEmailSuccessful();
                this._cookieService.set('confirm_mail', JSON.stringify(this.forgotPasswordForm.value));
                this._cookieService.set('mailType', JSON.stringify('reset'));
                this.router.navigate(['/auth/login']);
                this._appUtil.showAlert(AlertType.Success, AppLiterals.resetPasswordLinkHasSentSuccessfully);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.invalidForgotPasswordEmailId);
            }
        },
            err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
    }


    showResetEmailSuccessful() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.OneButtonDialog,
                title: "SUCCESSFUL",
                message: AppLiterals.resetPasswordLinkHasSentSuccessfully,
                yesButtonTitle: "OK",
                noButtonTitle: ""
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            this._cookieService.set('confirm_mail', JSON.stringify(this.forgotPasswordForm.value));
            this._cookieService.set('mailType', JSON.stringify('reset'));
            this.router.navigate(['/auth/login']);
        });
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: [this.userEmailId, [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]]
        });
    }
}
