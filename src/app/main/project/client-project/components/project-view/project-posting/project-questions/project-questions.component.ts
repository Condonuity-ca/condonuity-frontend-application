import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { QuestionAns } from "../../../../../models/question-ans.model";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectPostingService } from '../services/project-posting.service';
import { QaService } from "../../../../../service/qa.service";
import { AuthenticationService } from "../../../../../../../_services/authentication.service";
import { AppService } from '../../../../../../services/app.service';
import { APIResponse, AlertType, AppLiterals } from '../../../../../../../utils/app-constants';
import { AppUtilService } from '../../../../../../../utils/app-util.service';

export interface DialogData {
    userId: number;
    projectId: number;
}

@Component({
    selector: 'project-questions',
    templateUrl: './project-questions.component.html',
    styleUrls: ['./project-questions.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class PostingQuestionsComponent implements OnInit, OnDestroy {
    currentProject: any;
    qaList: QuestionAns[];
    currentUser: any;
    about: any;
    currentProjectId: number;
    currentProjectStage = 0;
    allExpandState = true;
    public show: boolean = false;
    public buttonName: any = 'Edit Message';
    toggle() {
        this.show = !this.show;

        // CHANGE THE NAME OF THE BUTTON.
        if (this.show)
            this.buttonName = "Remove";
        else
            this.buttonName = "Edit Message";
    }

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ProfileService} _profileService
     */
    constructor(
        private _qaService: QaService,
        private _authService: AuthenticationService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _projService: ProjectPostingService,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();


    }

    openAskQuestionDialog() {
        const dialogRef = this.dialog.open(AskQuestionDialog, { data: { userId: this.currentUser.userId, projectId: this.currentProjectId }, width: '500px' });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                let newQuestion = new QuestionAns();
                newQuestion.question = result;
                this.qaList.push(newQuestion)
            }
        });
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.currentUser = userData;
        });

        this._qaService.projectQaList.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
            if (data != null) {
                this.currentProjectStage = data.projectStage;
                this.currentProject = data.project;
                this.qaList = this.currentProject.questionAnswers;
                this.currentProjectId = this.currentProject.projectId;
            }
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


@Component({
    selector: 'ask-question-dialog',
    templateUrl: 'ask-question-dialog.html',
})
export class AskQuestionDialog {
    questionCreationForm: FormGroup;
    projectId: number;
    vendorId: number;

    constructor(
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<AskQuestionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        if (data) {
            this.projectId = data.projectId;
            this.vendorId = data.userId;
        }

        this.questionCreationForm = this._formBuilder.group({
            question: ['', Validators.required]
        });
    }

    postQuestion() {
        let vendorQuestion = this.questionCreationForm.value['question'];

        this._appService.postProjectQuestion(this.projectId, this.vendorId, vendorQuestion).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.vendorQuestionPostedSuccessfully);
                this.dialogRef.close(vendorQuestion)
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.vendorQuestionPostingFailed);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }
}