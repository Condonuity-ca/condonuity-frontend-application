import { NgModule, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@condonuity/shared.module';
import { ViewReviewComponent } from './view-review.component';

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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { JwPaginationModule } from 'jw-angular-pagination';

const routes = [
    {
        path     : '',
        component: ViewReviewComponent
    },
    {
        path : 'view',
        loadChildren : '../vendor-browser/view-vendors/view-vendors.module#ViewVendorsModule' 
    }

];

@NgModule({
    declarations: [
        ViewReviewComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        AngularCalendarModule.forRoot({
            provide   : DateAdapter,
            useFactory: adapterFactory
        }),
        FuseSharedModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
        NgxDatatableModule,
        MatButtonToggleModule,
		JwPaginationModule
    ],
    exports:[
        // VendorProfileComponent,
    ]
})
export class ViewReviewModule
{
}
