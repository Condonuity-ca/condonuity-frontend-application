import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { FuseWidgetModule } from '@condonuity/components/widget/widget.module';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FuseSharedModule } from '@condonuity/shared.module';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog'
// import { ProjectViewComponent } from './components/project-view/project-view.component'

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { VendorMainComponent  } from './components/vendor-main/vendor-main.component';

import { VendorInternalComponent } from './components/vendor-internal/vendor-internal.component';
import { VendorExternalComponent } from './components/vendor-external/vendor-external.component';
import {CreateThreadDialog} from 'app/main/messages/vendor-messages/components/vendor-internal/vendor-internal.component';
import {CreateThreadExternalDialog} from 'app/main/messages/vendor-messages/components/vendor-external/vendor-external.component';

const routes = [
  
    {
        path     : 'vendorMessages',
        component: VendorMainComponent
    },
];


@NgModule({
    declarations: [
        VendorMainComponent,
        VendorInternalComponent,
        VendorExternalComponent,
        CreateThreadDialog,
        CreateThreadExternalDialog,
            
    ],
    imports: [
        RouterModule.forChild(routes),
        MatFormFieldModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatMenuModule,
        FuseWidgetModule,
        MatInputModule,
        MatCheckboxModule,
        MatRadioModule,
        FuseSharedModule,
        AngularCalendarModule.forRoot({
            provide   : DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatDialogModule,
        NgxDatatableModule,
    ],
    providers   : [
        CookieService
    ],
    entryComponents: [ CreateThreadDialog,CreateThreadExternalDialog ],
    exports : [VendorMainComponent,VendorInternalComponent,VendorExternalComponent]

})
export class VendorMessagesModule
{

}
