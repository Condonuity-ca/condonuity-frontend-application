import { NgModule } from '@angular/core';

import { LoginModule } from 'app/main/authenticate/login/login.module';
import { ForgotPasswordModule } from 'app/main/authenticate/forgot-password/forgot-password.module';

@NgModule({
    imports: [
        // Authentication
        LoginModule,
        ForgotPasswordModule
    ]
})
export class AuthenticateModule
{

}
