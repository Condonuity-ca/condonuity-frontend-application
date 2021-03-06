import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { FuseSharedModule } from '@condonuity/shared.module';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ClientAccountComponent } from 'app/main/account/components/client-account/client-account.component';
import { UserManagementDialog } from 'app/main/account/components/client-account/client-account.component';
import { DeleteConfirmationDialog } from 'app/main/account/components/client-account/client-account.component';
import { VendorAccountComponent } from 'app/main/account/components/vendor-account/vendor-account.component';
import { BillingInformationComponent } from 'app/main/account/components/billing-information/billing-information.component';
import { BillingInfoDialog } from 'app/main/account/components/billing-information/billing-information.component';
import { AddUserDialog, AccountDetailsDialog, contactPersonDialog } from 'app/main/account/components/vendor-account/vendor-account.component';
import { UserAccountComponent } from 'app/main/account/components/user-account/user-account.component';
import { FaqComponent } from 'app/main/account/components/faq/faq.component';
import { UserAccountInfoDialog, PasswordChangeDialog, UserCorporationAccountInfoDialog } from 'app/main/account/components/user-account/user-account.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatRadioModule } from '@angular/material/radio';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes = [
    {
        path: 'clientDetails',
        component: ClientAccountComponent
    },
    {
        path: 'vendorDetails',
        component: VendorAccountComponent
    },
    {
        path: 'user',
        component: UserAccountComponent
    },
    {
        path: 'faq',
        component: FaqComponent
    },
];



@NgModule({
    declarations: [
        ClientAccountComponent,
        BillingInfoDialog,
        UserManagementDialog,
        DeleteConfirmationDialog,
        VendorAccountComponent,
        BillingInformationComponent,
        AddUserDialog,
        contactPersonDialog,
        AccountDetailsDialog,
        UserAccountComponent,
        FaqComponent,
        UserAccountInfoDialog,
        PasswordChangeDialog,
        UserCorporationAccountInfoDialog
    ],
    imports: [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        FuseSharedModule,
        MatStepperModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatInputModule,
        MatChipsModule,
        MatExpansionModule,
        MatRippleModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatDialogModule,
        MatGridListModule,
        NgxDatatableModule,
        MatRadioModule,
        MatTooltipModule
    ],
    providers: [
        DatePipe
    ],
    entryComponents: [
        BillingInfoDialog,
        UserManagementDialog,
        DeleteConfirmationDialog,
        AddUserDialog,
        AccountDetailsDialog,
        contactPersonDialog,
        UserAccountInfoDialog,
        PasswordChangeDialog,
        UserCorporationAccountInfoDialog
    ]
})

export class AccountModule {
}
