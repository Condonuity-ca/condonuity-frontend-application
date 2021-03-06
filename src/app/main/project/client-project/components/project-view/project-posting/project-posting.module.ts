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
import { ProjectPostingComponent, EditProjectInfoDialog } from './project-posting.component';
import { PostingFooterComponent } from './posting-footer/posting-footer.component';
import { PostingQuestionsComponent } from './project-questions/project-questions.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AskQuestionDialog } from './project-questions/project-questions.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@NgModule({
    declarations: [
        ProjectPostingComponent,
        PostingFooterComponent,
        PostingQuestionsComponent,
        AskQuestionDialog,
        EditProjectInfoDialog
    ],
    imports: [
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
            provide: DateAdapter,
            useFactory: adapterFactory
        }),

        MatDialogModule,
        RouterModule,
        MatExpansionModule,

        MatAutocompleteModule,
        MatDatepickerModule,
        MatChipsModule,
        NgxDatatableModule,


    ],
    providers: [
        CookieService
    ],
    entryComponents: [AskQuestionDialog, EditProjectInfoDialog],
    exports: [ProjectPostingComponent]

})
export class ProjectPostingModule {

}
