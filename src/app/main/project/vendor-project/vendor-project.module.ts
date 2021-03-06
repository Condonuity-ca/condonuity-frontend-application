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
import { VendorProjectListingComponent } from './vendor-project-listing/vendor-project-listing.component';
import { VendorProjectMainComponent } from './vendor-project-main/vendor-project-main.component';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { MatTooltipModule } from '@angular/material/tooltip';

// import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
// import { NgxPageScrollModule } from 'ngx-page-scroll';

const routes = [
    {
        path: 'vendor',
        component: VendorProjectMainComponent
    },
    {
        path: 'vendor/viewProjects',
        loadChildren: './vendor-project-view/vendor-project-view.module#VendorProjectViewModule'
    },

];


@NgModule({
    declarations: [
        VendorProjectListingComponent,
        VendorProjectMainComponent
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
        // NgxPageScrollCoreModule,
        // NgxPageScrollModule,
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
        MatTooltipModule
    ],
    providers: [
        CookieService
    ],
    entryComponents: [],
    exports: [VendorProjectListingComponent]

})
export class VendorProjectModule {

}
