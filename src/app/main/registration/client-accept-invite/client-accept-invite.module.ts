import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@condonuity/shared.module';

import { ClientAcceptInviteComponent } from 'app/main/registration/client-accept-invite/client-accept-invite.component';

const routes = [
    {
        path     : 'client-accept-invite',
        component: ClientAcceptInviteComponent
    }
];

@NgModule({
    declarations: [
        ClientAcceptInviteComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ]
})
export class ClientAcceptInviteModule
{
}
