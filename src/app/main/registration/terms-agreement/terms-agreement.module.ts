import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FuseSharedModule } from '@condonuity/shared.module';

import { TermsAgreementComponent } from 'app/main/registration/terms-agreement/terms-agreement.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
const routes = [
    {
        path     : 'register-organization',
        component: TermsAgreementComponent
    }
];

@NgModule({
    declarations: [
        TermsAgreementComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        FuseSharedModule
    ]
})
export class TermsAgreementModule
{
}
