import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@condonuity/shared.module';
import { ReviewsComponent } from 'app/main/support/tabs/reviews/reviews.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
import { MatDialogModule } from '@angular/material/dialog'
import { JwPaginationModule } from 'jw-angular-pagination';

const routes = [
    {
        path: '',
        component: ReviewsComponent
    },

];

@NgModule({
    declarations: [
        ReviewsComponent,



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
        MatButtonToggleModule,
        JwPaginationModule
    ],
    entryComponents: [],
    exports: [ReviewsComponent]

})

export class ReviewsModule {
}
