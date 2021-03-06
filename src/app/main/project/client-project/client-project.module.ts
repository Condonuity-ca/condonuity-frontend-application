import { NgModule } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CreateProjectComponent } from './components/create-project/create-project.component'
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
import { itemDetailsDialog } from './components/create-project/create-project.component'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSelectModule } from '@angular/material/select';
// import { ProjectViewComponent } from './components/project-view/project-view.component'
import { ProjectListingComponent } from './components/project-listing/project-listing.component'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ProjectMainComponent } from './components/project-main/project-main.component';
import { ProjectsHistoryComponent } from './components/projects-history/projects-history.component';
import { ProjectPreviewDialog } from './components/create-project/create-project.component';
import { DownloadDialog } from './components/project-listing/project-listing.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';


const routes = [
    {
        path: 'client',
        component: ProjectMainComponent
    },
    {
        path: 'client/viewProjects',
        loadChildren: './components/project-view/project-view.module#ProjectViewModule'
    },
];


@NgModule({
    declarations: [
        ProjectMainComponent,
        CreateProjectComponent,
        itemDetailsDialog,
        ProjectPreviewDialog,
        DownloadDialog,
        // ProjectViewComponent,
        ProjectListingComponent,
        ProjectsHistoryComponent
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
        MatSelectModule,
        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatDialogModule,
        NgxDatatableModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatTooltipModule

    ],
    providers: [
        CookieService
    ],
    entryComponents: [itemDetailsDialog, ProjectPreviewDialog, DownloadDialog],
    exports: [CreateProjectComponent, ProjectMainComponent]

})
export class ClientProjectModule {

}
