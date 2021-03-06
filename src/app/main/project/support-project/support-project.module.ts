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
import { MatDialogModule } from '@angular/material/dialog'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';

import { SupportProjectListingComponent } from './support-project-listing/support-project-listing.component';
import { SupportProjectMainComponent } from './support-project-main/support-project-main.component';
import { MatSelectModule } from '@angular/material/select';

const routes = [
    {
        path: 'support',
        component: SupportProjectMainComponent
    },
    {
        path: 'support/view',
        loadChildren: () => import('../vendor-project/vendor-project-view/vendor-project-view.module').then(m => m.VendorProjectViewModule)

        //loadChildren: './vendor-project/vendor-project-view/vendor-project-view.module#VendorProjectViewModule'
        //loadChildren: './support-project-view/support-project-view.module#SupportProjectViewModule'
    },
];


@NgModule({
    declarations: [
        SupportProjectListingComponent,
        SupportProjectMainComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        MatFormFieldModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatMenuModule,
        FuseWidgetModule,
        MatInputModule,
        MatCheckboxModule,
        MatRadioModule,
        FuseSharedModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatDialogModule,
        NgxDatatableModule,
        MatSelectModule,
        MatChipsModule,
        MatAutocompleteModule,
        DateRangePickerModule,
    ],
    providers: [
        CookieService
    ],
    entryComponents: [],
    exports: [SupportProjectListingComponent]

})
export class SupportProjectModule {

}
