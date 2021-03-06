import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ClientProjectModule } from './client-project/client-project.module';
import { VendorProjectModule } from './vendor-project/vendor-project.module';
import { SupportProjectModule } from './support-project/support-project.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    imports: [
        ClientProjectModule,
        VendorProjectModule,
        SupportProjectModule,
		MatTooltipModule
    ],
    providers   : [
        CookieService
    ]
})
export class ProjectModule
{

}
