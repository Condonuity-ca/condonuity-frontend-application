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

import { VendorProjectViewComponent } from './vendor-project-view.component';
import { MatTableModule } from '@angular/material'  
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { ProjectPostingModule } from '../../client-project/components/project-view/project-posting/project-posting.module';
import { BidInformationComponent } from '../bid-information/bid-information.component';
import { BidCreationComponent ,AskQuestionDialog } from '../bid-creation/bid-creation.component';
import { VendorViewComponent } from '../vendor-view/vendor-view.component';
import {DatePipe} from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes = [
    {
        path     : '',
        component: VendorProjectViewComponent
    },
];


@NgModule({
    declarations: [
        VendorProjectViewComponent,
        BidInformationComponent,
        BidCreationComponent,
        VendorViewComponent,
        AskQuestionDialog

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
        ProjectPostingModule,
		MatTooltipModule
    ],
    providers   : [
        CookieService,
        DatePipe
    ],
    entryComponents: [AskQuestionDialog ]

})
export class VendorProjectViewModule
{

}
