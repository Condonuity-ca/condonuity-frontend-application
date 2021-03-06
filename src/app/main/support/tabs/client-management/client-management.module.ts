import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseSharedModule } from '@condonuity/shared.module';
import { ClientManagementComponent } from 'app/main/support/tabs/client-management/client-management.component';
import { ClientDetailDialog, VendorDetailDialog } from 'app/main/support/tabs/client-management/client-management.component';
import { ClientVendorComponent } from 'app/main/support/tabs/client-management/client-vendor/client-vendor.component';
import { ClientCondoComponent } from 'app/main/support/tabs/client-management/client-condo/client-condo.component';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';


const routes = [
    {
        path: '',
        component: ClientManagementComponent
    },

];

@NgModule({
    declarations: [
        ClientManagementComponent,
        ClientDetailDialog,
        VendorDetailDialog,
        ClientVendorComponent,
        ClientCondoComponent


    ],
    imports: [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        FuseSharedModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatDialogModule,
        NgxDatatableModule,
        MatTabsModule,
        MatRadioModule
    ],
    entryComponents: [ClientDetailDialog, VendorDetailDialog],
    exports: [ClientManagementComponent, ClientVendorComponent, ClientCondoComponent]

})

export class ClientManagementModule {
}
