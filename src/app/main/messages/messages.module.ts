import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ClientMessagesModule } from './client-messages/client-messages.module';
import { VendorMessagesModule } from './vendor-messages/vendor-messages.module';




@NgModule({
    imports: [
        ClientMessagesModule,
        VendorMessagesModule
       
       
       
    ],
    providers   : [
        CookieService
    ]
})
export class MessagesModule
{

}
