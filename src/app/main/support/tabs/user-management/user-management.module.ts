import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseSharedModule } from '@condonuity/shared.module';
import { UserManagementComponent } from 'app/main/support/tabs/user-management/user-management.component';
import { UserVendorComponent, AddUserDialog } from 'app/main/support/tabs/user-management/user-vendor/user-vendor.component';
import { UserCondoComponent, UserManagementDialog } from 'app/main/support/tabs/user-management/user-condo/user-condo.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';

import { UserDetailDialog, AddVendorUserDialog } from 'app/main/support/tabs/user-management/user-management.component';

import { MatDialogModule } from '@angular/material/dialog'

const routes = [{
    path: '',
    component: UserManagementComponent
},
];

@NgModule({
    declarations: [
        UserManagementComponent,
        UserDetailDialog,
        AddUserDialog,
        AddVendorUserDialog,
        UserVendorComponent,
        UserCondoComponent,
        UserManagementDialog
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
        NgxDatatableModule,
        MatDialogModule,
        MatTabsModule,
        MatRadioModule
    ],
    exports: [
        UserManagementComponent, UserVendorComponent, UserCondoComponent
    ],
    entryComponents: [UserDetailDialog, AddUserDialog, AddVendorUserDialog, UserManagementDialog]
})
export class UserManagementModule {
}
