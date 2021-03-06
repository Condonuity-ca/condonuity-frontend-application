import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@condonuity/shared.module';
// import { MatPasswordStrengthInfoComponent, MatPasswordStrengthComponent } from '@angular-material-extensions/password-strength';

import { CreatePasswordComponent } from 'app/main/registration/create-password/create-password.component';

const routes = [
    {
        path: 'create-password',
        component: CreatePasswordComponent
    },
];

@NgModule({
    declarations: [
        CreatePasswordComponent,
        // MatPasswordStrengthInfoComponent,
        // MatPasswordStrengthComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        FuseSharedModule
    ]
})
export class CreatePasswordModule {
}
