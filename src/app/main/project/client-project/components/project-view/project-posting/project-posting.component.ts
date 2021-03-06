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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectPostingService } from './services/project-posting.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'app/_services/authentication.service';
import { ContractType, ProjectStatus, APIResponse, AlertType, AppLiterals, SearchBarPageIndex, AppDateFormat, MaxFileSize } from '../../../../../../utils/app-constants';
import { AppUtilService } from '../../../../../../utils/app-util.service';
import { AppService } from '../../../../../services/app.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { DialogType } from 'app/main/Shared/download-dialog/download-dialog.component';
import { ConfirmationDialogComponent } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { Item } from '../../models/item.model';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';
import * as moment from 'moment';
import { itemDetailsDialog } from '../../create-project/create-project.component';

export interface DialogData {
    userData: any;
    notifications: any;
    projectInfo: any;
}

@Component({
    selector: 'project-posting',
    templateUrl: './project-posting.component.html',
    styleUrls: ['./project-posting.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class ProjectPostingComponent implements OnInit, OnDestroy {
    currentUser: any;
    about: any;
    projectInfo;
    selectedProject;
    isProjectDetailsLoaded: boolean = false;
    contractType: string = '';
    projectStatus: string = '';
    cloneProjectEnabled = false;
    shouldShowCancelButton = false;

    shouldOpenProjectInEditMode = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ProfileService} _profileService
     */
    constructor(
        private _appUtil: AppUtilService,
        private _appService: AppService,
        public dialog: MatDialog,
        private _projPostService: ProjectPostingService,
        private router: Router,
        private _authService: AuthenticationService,
        private _menuService: MenuService
    ) {

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.currentUser = userData;
        });

        this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            data => {

                if (data != null) {
                    if (data.openProjectInEditMode != null && data.openProjectInEditMode == true) {
                        this.shouldOpenProjectInEditMode = true;
                    }
                }

                if (data == null) {
                    let user = _authService.currentUserValue;

                    if (user.userType == 1) {
                        this.router.navigate(['projects/client']);
                    } else {
                        this.router.navigate(['projects/vendor']);
                    }
                } else {
                    if (data.project) {
                        this.isProjectDetailsLoaded = true;
                        this.projectInfo = data.project;
                        this.projectInfo.tags.sort((a, b) => a.tagName.localeCompare(b.tagName));

                        this.populateProjectDetails(data);
                    }
                }
            });
    }

    imageClicked(fileDetails) {
        this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
    }

    submitAnswer(question, answer) {
        this._appService.answerToProjectQuestion(question.projectqaId, this.currentUser.clientId, answer).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.clientAnswerSubmissionSuccessful);
                let currentQues = this.projectInfo.questionAnswers.find(ques => ques.projectqaId == question.projectqaId);
                currentQues.answer = answer;
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.clientAnswerSubmissionFailed);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    getUpdatedProjectDetails() {
        this._appService.getProjectById(this.projectInfo.projectId).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this.projectInfo = response.project;
                this.populateProjectDetails(response);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            console.log(err);
        });
    }


    populateProjectDetails(data) {
        var createdDate = moment.utc(this.projectInfo.createdAt).toDate();
        this.projectInfo.formattedProjectPostedDate = moment(createdDate).format(AppDateFormat.DisplayFormat);
        this.projectInfo.formattedbidEndDate = moment(this.projectInfo.bidEndDate).format('MM/DD/YYYY');
        this.projectInfo.formattedprojectStartDate = moment(this.projectInfo.projectStartDate).format('MM/DD/YYYY');
        this.projectInfo.formattedprojectCompletionDeadline = moment(this.projectInfo.projectCompletionDeadline).format('MM/DD/YYYY');


        if (this.projectInfo.contractType == ContractType.AnnualContract) {
            this.contractType = 'Annual Contract';
        } else if (this.projectInfo.contractType == ContractType.FixedCost) {
            this.contractType = 'Fixed Cost';
        } if (this.projectInfo.contractType == ContractType.TimeAndMaterial) {
            this.contractType = 'Time & Material';
        }

        switch (this.projectInfo.status) {
            case ProjectStatus.Published: {
                this.projectStatus = 'Published';
                break;
            }
            case ProjectStatus.Unpublished: {
                this.projectStatus = 'Un-published';
                break;
            }
            case ProjectStatus.Completed: {
                this.cloneProjectEnabled = true;
                if (this.projectInfo.awardedBidId != null && this.projectInfo.awardedBidId != '') {
                    this.projectStatus = 'Awarded';
                } else {
                    this.projectStatus = 'Bidding Closed';
                    this.shouldShowCancelButton = true;
                }
                break;
            }
            case ProjectStatus.Cancelled: {
                this.cloneProjectEnabled = true;
                this.projectStatus = 'Cancelled';
                break;
            }
        }
        this.projectInfo.questionAnswers = data.questionAnswers;

    }


    openEditProjectDialog() {
        const EditProjectInfoDialogRef = this.dialog.open(EditProjectInfoDialog, { data: { projectInfo: this.projectInfo, userData: this.currentUser }, width: '70%', height: 'auto' });
        EditProjectInfoDialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getUpdatedProjectDetails();
            }
        });
    }


    publishProject() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: AppLiterals.confirmProjectPublish,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {

                if (result == 'true') {
                    this.confirmProjectPublish(this.projectInfo.projectId);
                }
            }
        });
    }

    cancelProject() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: AppLiterals.confirmProjectDeletion,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.confirmProjectCancellation(this.projectInfo.projectId);
                }
            }
        });
    }

    cloneProject() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: AppLiterals.confirmProjectClone,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.confirmProjectClone(this.projectInfo.projectId);
                }
            }
        });
    }

    confirmProjectClone(projectId) {
        this._appService.cloneProject(projectId).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this.showCloneSuccessfulDialog();
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.cloneProjectUnsuccessful);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    showCloneSuccessfulDialog() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.OneButtonDialog,
                title: "SUCCESS",
                message: AppLiterals.cloneProjectSuccessful,
                yesButtonTitle: "OK",
                noButtonTitle: ""
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.router.navigate(['/projects/client']);
                }
            }
        });
    }

    confirmProjectCancellation(projectId) {
        this._appService.cancelProject(projectId, this.currentUser.clientId).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.cancelProjectSuccessful);
                this.router.navigate(['/projects/client']);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.cancelProjectUnsuccessful);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    confirmProjectPublish(projectId) {
        this._appService.publishProject(projectId).subscribe(response => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.publishProjectSuccessful);
                this.router.navigate(['/projects/client']);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.publishProjectUnsuccessful);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}



@Component({
    selector: 'edit-project-dialog',
    templateUrl: 'edit-project-dialog.html',
    animations: fuseAnimations
})


export class EditProjectInfoDialog {

    currentUser: any;

    bidEndDateMin = new Date();
    projectStartDateMin = new Date();
    projectStartDeadLinMin = new Date();

    projectForm: FormGroup;
    about: any;
    itemDetailsList: Item[] = [];
    imageFileData = [];
    docsFileData = [];
    functionType: number = 1;
    // clientOrganization: any;
    tagList = [];
    selectedTagList = [];

    fileToUpload: File = null;
    imageFileList: File[];
    docFileList: any[];

    isNewProjectCreated = false;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    allTags: Tag[];
    tagCtrl = new FormControl();
    selectedTags: Tag[] = [];
    filteredTags: Observable<Tag[]>;

    cityCtrl = new FormControl();
    selectedCities: City[] = [];
    filteredCities: Observable<City[]>;

    selectedContractType: number;
    projectInfo: any;

    isFixedCost = false;
    isTimeAndMaterial = false;
    isAnnualContract = false;
    isInsuranceRequired = false;
    isPublishFavVendorsOnly = false;

    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    corpEditform: FormGroup;
    mandatory = "Mandatory field is required";
    public updatedProfileData = {};
    corpDetails;

    private _unsubscribeAll: Subject<any>;


    constructor(
        public dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        public dialogRef: MatDialogRef<EditProjectInfoDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private datePipe: DatePipe,
        private _menuService: MenuService

    ) {
        this._unsubscribeAll = new Subject();
        this.getProjectTags();
        this.projectInfo = Object.assign({}, data.projectInfo);
        this.currentUser = data.userData;

        if (this.projectInfo.contractType == ContractType.AnnualContract) {
            this.isAnnualContract = true;
        } else if (this.projectInfo.contractType == ContractType.FixedCost) {
            this.isFixedCost = true;
        } if (this.projectInfo.contractType == ContractType.TimeAndMaterial) {
            this.isTimeAndMaterial = true;
        }
        this.selectedContractType = this.projectInfo.contractType;

        if (this.projectInfo.insuranceRequired == "1") {
            this.isInsuranceRequired = true;
        }

        if (this.projectInfo.postType == '1') {
            this.isPublishFavVendorsOnly = false;
        } else {
            this.isPublishFavVendorsOnly = true;
        }


        var projectBudget = "";

        if (this.projectInfo.estimatedBudget != null && this.projectInfo.estimatedBudget != "") {
            projectBudget = this.projectInfo.estimatedBudget;
        }


        this.projectForm = this._formBuilder.group({
            projIdentifiers: this._formBuilder.group({
                projName: [this.projectInfo.projectName, Validators.required],
                tags: ['']
            }),
            projDetails: this._formBuilder.group({
                bidEndDate: [moment(this.projectInfo.bidEndDate), Validators.required],
                projStartDate: [moment(this.projectInfo.projectStartDate), Validators.required],
                projEndDate: [moment(this.projectInfo.projectCompletionDeadline), Validators.required],
                estimatedBudget: [projectBudget]
            }),
            contractType: this._formBuilder.group({
                fixedCost: [this.isFixedCost],
                timeMaterial: [this.isTimeAndMaterial],
                annualContract: [this.isAnnualContract]
            }),
            itemDetails: this._formBuilder.array([]),
            description: [this.projectInfo.description, Validators.required],
            specialConditions: [this.projectInfo.specialConditions],
            otherInfo: this._formBuilder.group({
                insureanceConfirm: [''],
                preferredVendorsOnly: [this.isPublishFavVendorsOnly]
            })
        });
    }

    ngAfterViewInit() {
        for (let product of this.projectInfo.projectProducts) {
            this.addExistingItemsList(product);
        }

        this.docFileList = [];
        for (let document of this.projectInfo.projectFiles) {
            let file = {
                "name": document.fileName,
                "formatedSize": document.fileSize,
                "isExistingFile": true,
                "attachmentId": document.id
            }
            this.docFileList.push(file);
        }
    }

    public update() {

    }

    dateChanged(selectedDate, controlId) {
        if (controlId == 1) {
            let sDateString = selectedDate.value.format(AppDateFormat.DisplayFormat);
            let sDate = moment(sDateString).toDate();
            this.projectStartDateMin = sDate;
            this.projectStartDeadLinMin = sDate;
        } else if (controlId == 2) {
            let sDateString = selectedDate.value.format(AppDateFormat.DisplayFormat);
            let sDate = moment(sDateString).toDate();
            this.projectStartDeadLinMin = sDate;
        } else {
            // let sDateString = selectedDate.value.format(AppDateFormat.DisplayFormat);
            // let sDate = moment(sDateString).toDate();
            // this.projectStartDateMin = new Date(new Date().setDate(sDate.getDate() - 1));
        }
    }


    openItemDialog() {
        const userAccountRef = this.dialog.open(itemDetailsDialog, { width: '500px', height: 'auto' });
        userAccountRef.afterClosed().subscribe(result => {
            if (result) {
                this.addItemsList(result)
            }
        });
    }

    addItemsList(data) {

        let listItems = <FormArray>this.projectForm.controls.itemDetails as FormArray;
        listItems.push(this._formBuilder.group({
            itemDescription: [data.itemDescription, Validators.required],
            quantity: [data.quantity, [Validators.required, Validators.pattern("^[0-9]*$")]],
            units: [data.units, Validators.required]
        }));

        this.itemDetailsList.push(data);
    }

    addExistingItemsList(data) {
        let listItems = <FormArray>this.projectForm.controls.itemDetails as FormArray;
        listItems.push(this._formBuilder.group({
            itemDescription: [data.description, Validators.required],
            quantity: [data.quantity, [Validators.required, Validators.pattern("^[0-9]*$")]],
            units: [data.unit, Validators.required]
        }));

        this.itemDetailsList.push(data);
    }

    removeItem(id: number) {
        let listItems = <FormArray>this.projectForm.controls.itemDetails as FormArray;
        listItems.removeAt(id);
        this.itemDetailsList.splice(id, 1)
    }

    removeDocAttachment(index) {
        this.docFileList.splice(index, 1);
    }

    appendDocumentFiles(event) {
        let files = event.target.files;

        if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
            if (this.docFileList == null) {
                this.docFileList = [];
            }
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                file.formatedSize = AppUtilService.formatSizeUnits(file.size);
                file.isExistingFile = false;
                file.attachmentId = "0";
                this.docFileList.push(file)
            }
        }
        else {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
        }
    }

    //********************* Filter Section Begins *****************************/

    private _filter(value): Tag[] {
        let return_value: any;
        if (this.allTags.includes(value)) {
            return_value = this.allTags.filter((data: Tag) => data.tagName.toLowerCase().indexOf(value) !== -1);
            this.selectedHandle(value);
        } else {
            const filterValue = value.toLowerCase();
            return_value = this.allTags.filter((data: Tag) => data.tagName.toLowerCase().indexOf(filterValue) !== -1);
        }
        return return_value;
    }

    private selectedHandle(value: Tag) {
        let index = this.allTags.indexOf(value)
        this.allTags.splice(index, 1);
        this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
        this.projectForm.get(['projIdentifiers', 'tags']).setValue(this.selectedTags);
        this.tagInput.nativeElement.blur();
        this.tagInput.nativeElement.focus();
    }

    remove(data: Tag): void {
        const index = this.selectedTags.indexOf(data);
        if (index >= 0) {
            this.selectedTags.splice(index, 1);
            this.allTags.push(data);
            this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
            this.tagCtrl.setValue(null);
            this.projectForm.get(['projIdentifiers', 'tags']).setValue(this.selectedTags);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.selectedTags.push(event.option.value);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
        this.tagInput.nativeElement.blur();
        this.tagInput.nativeElement.focus();
    }

    getProjectTags() {
        this._appService.getProjectTagList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.allTags = response.tags;
                this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
                this.filteredTags = this.tagCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));

                for (let tag of this.projectInfo.tags) {
                    let index = this.allTags.indexOf(tag);
                    this.allTags.splice(index, 1);
                    this.selectedTags.push(tag);
                }
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    saveProject() {
        this.postProject(ProjectStatus.Unpublished);
    }

    publishProject() {
        this.postProject(ProjectStatus.Published);
    }

    contractChanged(contractType) {
        this.selectedContractType = contractType;
    }

    postProject(projectStatus) {
        this.selectedTagList = this.selectedTags.map(function (tag) {
            return tag.tagId;
        });

        let formValue = this.projectForm.value;
        let products = formValue.itemDetails.map((x: any) => {
            return {
                'description': x.itemDescription,
                'quantity': x.quantity,
                'unit': x.units
            }
        });

        var shouldPublishToFavVendors = 1;
        if (formValue.otherInfo.preferredVendorsOnly == true) {
            shouldPublishToFavVendors = 2;
        }

        var projectBudget = formValue.projDetails.estimatedBudget;
        if (projectBudget == "--") {
            projectBudget = "";
        }

        let projectDetails = {
            'projectId': this.projectInfo.projectId,
            'bidEndDate': formValue.projDetails.bidEndDate.format("YYYY-MM-DD"),
            'city': '',
            'clientId': this.currentUser.clientId,
            'clientOrganisationId': this.currentUser.currentOrgId,
            'contractType': this.selectedContractType,
            'description': formValue.description,
            'duration': '',
            'estimatedBudget': projectBudget,
            'insuranceRequired': formValue.otherInfo.insureanceConfirm,
            'postType': shouldPublishToFavVendors,
            'projectCompletionDeadline': formValue.projDetails.projEndDate.format("YYYY-MM-DD"),
            'projectName': formValue.projIdentifiers.projName,
            'projectStartDate': formValue.projDetails.projStartDate.format("YYYY-MM-DD"),
            'specialConditions': formValue.specialConditions,
            'status': projectStatus,
            'tags': this.selectedTagList.toString(),
            'projectProducts': products
        }

        this._appService.updateProject(projectDetails).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this.updateProjectDocuments();
            } else {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.unableToUpdateProjectDetails);
                this.dialogRef.close(true);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    updateProjectDocuments() {
        var filesToDelete = [];
        var filesToUpload = this.docFileList.filter(document => document.isExistingFile == false);
        this.projectInfo.projectFiles.forEach(file => {
            let filteredFile = this.docFileList.find(document => document.attachmentId == file.id);
            if (filteredFile == null) {
                filesToDelete.push(file);
            }
        });


        if (filesToDelete != null && filesToDelete.length > 0) {
            this.deleteProjectAttachments(filesToDelete);
        }

        if (filesToUpload != null && filesToUpload.length > 0) {
            this.postProjectAttachments(filesToUpload);
        } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.projectUpdationSuccessfulMessage);
            this.dialogRef.close(true);
        }
    }

    deleteProjectAttachments(filesToDelete) {

        var fileIdArray = filesToDelete.map(function (file) {
            return file.id;
        });
        this._appService.deleteProjectFile(fileIdArray).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this._appUtil.showAlert(AlertType.Success, AppLiterals.projectUpdationSuccessfulMessage);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    postProjectAttachments(filesToUpload) {
        let successfileUpload = 0;
        filesToUpload.forEach(file => {
            this._appService.uploadFileForProject(file, this.projectInfo.projectId).subscribe((response: any) => {
                if (response.statusCode == APIResponse.Success) {
                    successfileUpload = successfileUpload + 1;
                    if (successfileUpload == this.docFileList.length) {
                        this._appUtil.showAlert(AlertType.Success, AppLiterals.projectUpdationSuccessfulMessage);
                        this.dialogRef.close(true);
                    }
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                }
            }, err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                console.log(err);
            });
        });
    }
}
