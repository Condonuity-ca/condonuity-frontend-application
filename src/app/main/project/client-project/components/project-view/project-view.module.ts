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
import { ProjectViewComponent } from './project-view.component';
// import { ProjectPostingComponent } from './project-posting/project-posting.component';
import { BiddingResultsComponent } from './bidding-results/bidding-results.component';
import { BidListComponent } from './bid-list/bid-list.component';
import { MatTableModule } from '@angular/material'  
import { BidDetailsComponent } from './bid-details/bid-details.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { AwardDetailsComponent ,EditAwardeeDialog } from './award-details/award-details.component';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { MatSelectModule } from '@angular/material/select';
import { EditProjectComponent } from './project-posting/edit-project/edit-project.component';
import { ClientProjectModule } from '../../client-project.module';
import { ProjectPostingModule } from './project-posting/project-posting.module';
const routes = [
    {
        path     : '',
        component: ProjectViewComponent
    },
    {
        path    : 'edit-project/:id',
        component: EditProjectComponent

    }

];


@NgModule({
    declarations: [
        ProjectViewComponent,
        // ProjectPostingComponent,
        BiddingResultsComponent,
        BidListComponent,
        BidDetailsComponent,
        AwardDetailsComponent,
        ProjectInfoComponent,
        EditAwardeeDialog,
        EditProjectComponent,

        
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
            provide   : DateAdapter,
            useFactory: adapterFactory
        }),
        MatDatepickerModule,
        MatDialogModule,
        NgxDatatableModule,
        MatTableModule,
        MatExpansionModule,
        MatSortModule,
        MatPaginatorModule,
        MatSelectModule,
        ClientProjectModule,
        ProjectPostingModule
    ],
    providers   : [
        CookieService
    ],
    entryComponents: [ EditAwardeeDialog ],
    // exports:[ProjectPostingComponent]

})
export class ProjectViewModule
{

}
