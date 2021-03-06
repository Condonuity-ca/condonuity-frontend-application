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
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ClientMainComponent } from './components/client-main/client-main.component';
import { JwPaginationModule } from 'jw-angular-pagination';
import { ClientInternalComponent } from './components/client-internal/client-internal.component';
import { ClientExternalComponent } from './components/client-external/client-external.component';
//import { CreateThreadDialog } from './components/client-thread-dialog/client-thread-dialog.component';
import { CreateThreadDialog } from 'app/main/messages/client-messages/components/client-internal/client-internal.component';
import { CreateThreadExternalDialog } from 'app/main/messages/client-messages/components/client-external/client-external.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';



const routes = [
    {
        path: 'clientMessages',
        component: ClientMainComponent

    },
    {
        path: 'clientMessages/view',
        loadChildren: './components/internal-view/internal-view.module#InternalViewModule'
    },
];


@NgModule({
    declarations: [
        ClientMainComponent,
        ClientInternalComponent,
        ClientExternalComponent,
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
        MatMenuModule,
        FuseWidgetModule,
        MatInputModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatRadioModule,
        FuseSharedModule,
        JwPaginationModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatDialogModule,
        MatButtonToggleModule,
        NgxDatatableModule,
        MatChipsModule,
        MatAutocompleteModule
    ],
    providers: [
        CookieService
    ],
    entryComponents: [CreateThreadDialog, CreateThreadExternalDialog],
    exports: [ClientMainComponent, ClientInternalComponent, ClientExternalComponent]

})
export class ClientMessagesModule {

}
