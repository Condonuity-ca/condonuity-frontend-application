import { NgModule } from '@angular/core';

import { RegisterModule } from 'app/main/registration/register/register.module';
import { MailConfirmModule } from 'app/main/registration/mail-confirm/mail-confirm.module';
import { ClientAcceptInviteModule } from 'app/main/registration/client-accept-invite/client-accept-invite.module';
import { TermsAgreementModule } from 'app/main/registration/terms-agreement/terms-agreement.module';
import { UserTermsAgreementModule } from 'app/main/registration/user-terms-agreement/user-terms-agreement.module';
import { CorpRegisterModule } from 'app/main/registration/corp-register/corp-register.module';
import { CreatePasswordModule } from 'app/main/registration/create-password/create-password.module';
import { CookieService } from 'ngx-cookie-service';
import { VendorRegisterModule } from './vendor-register/vendor-register.module';
@NgModule({
    imports: [
        // Authentication
        RegisterModule,
        MailConfirmModule,
        ClientAcceptInviteModule,
        TermsAgreementModule,
        UserTermsAgreementModule,
        CorpRegisterModule,
        CreatePasswordModule,
        VendorRegisterModule
    ],
    providers   : [
        CookieService
    ]
})
export class RegistrationModule
{

}
