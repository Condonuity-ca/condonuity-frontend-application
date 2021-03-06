import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { FuseSharedModule } from '@condonuity/shared.module';

import { RegisterComponent } from 'app/main/registration/register/register.component';
import { MatRadioModule } from '@angular/material/radio';
const routes = [
    {
        path     : 'new',
        component: RegisterComponent
    },
];

@NgModule({
    declarations: [
        RegisterComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
		MatRadioModule,
        FuseSharedModule,
        MatButtonToggleModule
    ]
})
export class RegisterModule
{
}
