import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TabsModule } from './tabs/tabs.module';
//import { ContractManagementModule } from './tabs/components/contract-management/contract-management.module';
//import { VendorMessagesModule } from './vendor-messages/vendor-messages.module';




@NgModule({
    imports: [
        TabsModule,
     //   ContractManagementModule,
        //VendorMessagesModule
       
       
       
    ],
    providers   : [
        CookieService
    ]
})
export class ManagementToolsModule
{

}
