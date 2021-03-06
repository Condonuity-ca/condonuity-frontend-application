import { Component, ViewEncapsulation } from '@angular/core';

import { FuseConfigService } from '@condonuity/services/config.service';
import { fuseAnimations } from '@condonuity/animations';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
    selector     : 'mail-confirm',
    templateUrl  : './mail-confirm.component.html',
    styleUrls    : ['./mail-confirm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class MailConfirmComponent
{
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _cookieService: CookieService,
        private router : Router,

    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: false
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

     this.getValues();

    }
    email:string;
    type:string;

    getValues()
    {
        if(this._cookieService.check('confirm_mail') == true)
        {
            this.email = JSON.parse(this._cookieService.get('confirm_mail'));
            this.type = JSON.parse(this._cookieService.get('mailType'));
            // this._cookieService.delete('confirm_mail');
            this._cookieService.delete('mailType');
        }
        else{
        this.router.navigate(['/auth/register/']);    
        }
    }
}
