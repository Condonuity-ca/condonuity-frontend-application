import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@condonuity/shared.module';
import { ContactUsComponent } from 'app/main/support/tabs/contact-us/contact-us.component';

import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';

import {MatDialogModule} from '@angular/material/dialog'

const routes = [
    {
        path     : '',
        component: ContactUsComponent
    },

];

@NgModule({
    declarations: [
        ContactUsComponent
        

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
        MatDialogModule
    ],
    entryComponents: [  ],
    exports:[ContactUsComponent]

})

export class ContactUsModule {
}
