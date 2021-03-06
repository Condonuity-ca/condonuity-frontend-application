import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FuseSharedModule } from '@condonuity/shared.module';

import { UserTermsAgreementComponent } from 'app/main/registration/user-terms-agreement/user-terms-agreement.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
const routes = [
    {
        path     : 'accept-invite',
        component: UserTermsAgreementComponent
    }
];

@NgModule({
    declarations: [
        UserTermsAgreementComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        FuseSharedModule
    ]
})
export class UserTermsAgreementModule
{
}
