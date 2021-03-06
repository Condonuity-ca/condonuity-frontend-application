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

import { TaskComponent, CreateTaskDialog, TaskCommentsDialog } from './components/task/task.component';
import { ContractManagementComponent,AddContractDialog } from './components/contract-management/contract-management.component';
import { BuildingRepositoryComponent, CreateBuildingRepositoryDialog, ViewBuildingRepositoryDialog} from './components/building-repository/building-repository.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TabComponent  } from './components/tab/tab.component';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { JwPaginationModule } from 'jw-angular-pagination';






const routes = [
   {
        path     : 'task',
        component: TabComponent
        
    }
];


@NgModule({
    declarations: [
        TabComponent,
        TaskComponent,
        ContractManagementComponent,
        AddContractDialog,
        CreateBuildingRepositoryDialog,
        ViewBuildingRepositoryDialog,
        CreateTaskDialog,
        BuildingRepositoryComponent,
        TaskCommentsDialog,
     

        
        
    ],
    imports: [
        RouterModule.forChild(routes),
        MatFormFieldModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatMenuModule,
        MatSelectModule,
        MatStepperModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
		JwPaginationModule,
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
        MatButtonToggleModule,
        NgxDatatableModule,
    ],
    providers   : [
        CookieService
    ],
    entryComponents: [AddContractDialog, CreateBuildingRepositoryDialog,ViewBuildingRepositoryDialog,CreateTaskDialog, TaskCommentsDialog  ],
    exports : [TabComponent,TaskComponent,ContractManagementComponent,BuildingRepositoryComponent]

})
export class TabsModule
{

}
