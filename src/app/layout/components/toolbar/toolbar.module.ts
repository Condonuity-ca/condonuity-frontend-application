import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NotificationDialog } from 'app/layout/components/toolbar/toolbar.component';
import { AddClientDialog } from 'app/layout/components/toolbar/toolbar.component';
import { MatFormFieldModule } from '@angular/material';

import { FuseSearchBarModule, FuseShortcutsModule } from '@condonuity/components';
import { FuseSharedModule } from '@condonuity/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import { MatInputModule } from '@angular/material';



import { CorpRegisterComponent } from 'app/main/registration/corp-register/corp-register.component';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
    declarations: [
        ToolbarComponent,
        NotificationDialog,
        AddClientDialog

    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatMenuModule,
        MatToolbarModule,
        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        })
    ],
    exports: [
        ToolbarComponent
    ],
    entryComponents: [NotificationDialog, AddClientDialog
    ]
})
export class ToolbarModule {
}
