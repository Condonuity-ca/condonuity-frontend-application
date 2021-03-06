import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input, EventEmitter, Output } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../models/item.model';
import { AppService } from '../../../../services/app.service';
import { CommonFunctionsService } from '../../../../../../app/_services/common-functions.service';
import { APIResponse, ProjectStatus, AppDateFormat, ContractType, MaxFileSize } from '../../../../../../app/utils/app-constants';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { AppUtilService } from '../../../../../utils/app-util.service';
import { AlertType, AppLiterals } from '../../../../../utils/app-constants';
import { MenuService } from '../../../../../layout/components/toolbar/menu.service'
import * as moment from 'moment';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { Tag } from 'app/main/profile/tabs/models/tag.model';
import { City } from 'app/main/profile/tabs/models/city.model';
import { AuthenticationService } from 'app/_services/authentication.service';

export interface DialogData {
  projectData: any;
  docFileList: any;
}


@Component({
  selector: 'create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateProjectComponent implements OnInit, OnDestroy {

  @Input()
  set projectId(projId: string) {
    this.functionType = 2;
  }

  @Output() messageToEmit = new EventEmitter<boolean>();

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
  docFileList: File[];

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

  currentUser: any;

  @ViewChild('chipList', { static: false }) chipList: MatChipList;

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _authService: AuthenticationService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _appService: AppService,
    private _commonFunctionsService: CommonFunctionsService,
    private _appUtil: AppUtilService,
    private _menuService: MenuService
  ) {
    this._unsubscribeAll = new Subject();
    this.getProjectTags();

    this.projectForm = this._formBuilder.group({
      projIdentifiers: this._formBuilder.group({
        projName: ['', Validators.required],
        tags: [null],
        finalTags: [this.selectedTags, this.validateTags],
      }),
      projDetails: this._formBuilder.group({
        bidEndDate: ['', Validators.required],
        projStartDate: ['', Validators.required],
        projEndDate: ['', Validators.required],
        estimatedBudget: ['']
      }),
      contractType: this._formBuilder.group({
        fixedCost: [false],
        timeMaterial: [false],
        annualContract: [false]
      }),
      itemDetails: this._formBuilder.array([]),
      description: ['', Validators.required],
      specialConditions: [''],
      otherInfo: this._formBuilder.group({
        insureanceConfirm: ['', Validators.required],
        preferredVendorsOnly: ['']
      })
    });

    this.projectForm.get(['projIdentifiers', 'finalTags']).statusChanges.subscribe(
      status => this.chipList.errorState = status === 'INVALID'
    );

    this._authService.currentUser.subscribe(userDetails => {
      this.currentUser = userDetails;
    });
  }


  openProjectPreviewDialog() {
    let projectDetails = this.getNewProjectDetails()
    const userNewRef = this.dialog.open(ProjectPreviewDialog, { width: '580%', data: { projectData: projectDetails, docFileList: this.docFileList } });
  }

  getNewProjectDetails() {

    let formValue = this.projectForm.value;

    let contractType;
    if (this.selectedContractType == ContractType.AnnualContract) {
      contractType = 'Annual Contract';
    } else if (this.selectedContractType == ContractType.FixedCost) {
      contractType = 'Fixed Cost';
    } else if (this.selectedContractType == ContractType.TimeAndMaterial) {
      contractType = 'Time & Material';
    }

    let selectedTags = this.selectedTags.map(function (tag) {
      return tag.tagName;
    });

    let insuranceValue = '';
    if (formValue.otherInfo.insureanceConfirm == 1) {
      insuranceValue = 'Yes';
    } else {
      insuranceValue = 'No';
    }

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


    let projectDetails = {
      'bidEndDate': formValue.projDetails.bidEndDate.format(AppDateFormat.DisplayFormat),
      'city': '',
      'clientId': this.currentUser.clientId,
      'clientOrganisationId': this.currentUser.currentOrgId,
      'contractType': contractType,
      'description': formValue.description,
      'duration': '',
      'estimatedBudget': formValue.projDetails.estimatedBudget,
      'insuranceRequired': insuranceValue,
      'postType': shouldPublishToFavVendors,
      'projectCompletionDeadline': formValue.projDetails.projEndDate.format(AppDateFormat.DisplayFormat),
      'projectName': formValue.projIdentifiers.projName,
      'projectStartDate': formValue.projDetails.projStartDate.format(AppDateFormat.DisplayFormat),
      'specialConditions': formValue.specialConditions,
      'status': ProjectStatus.Unpublished,
      'tags': selectedTags.toString(),
      'projectProducts': products
    }
    return projectDetails;
  }

  dateChanged(selectedDate, controlId) {
    if (controlId == 1) {
      let sDateString = selectedDate.value.format(AppDateFormat.DisplayFormat);
      let sDate = moment(sDateString).toDate();
      this.projectStartDateMin = sDate;
      // new Date(new Date().setDate(sDate.getDate() + 1));
      this.projectStartDeadLinMin = sDate;
      // new Date(new Date().setDate(sDate.getDate() + 1));
    } else if (controlId == 2) {
      let sDateString = selectedDate.value.format(AppDateFormat.DisplayFormat);
      let sDate = moment(sDateString).toDate();
      this.projectStartDeadLinMin = sDate;
      // new Date(new Date().setDate(sDate.getDate() + 1));
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
      quantity: [data.quantity, [Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,5})?$')]],
      units: [data.units, Validators.required]
    }));

    this.itemDetailsList.push(data);
  }

  removeItem(id: number) {
    let listItems = <FormArray>this.projectForm.controls.itemDetails as FormArray;
    listItems.removeAt(id);
    this.itemDetailsList.splice(id, 1)
  }

  fileEvent(files: FileList) {

    this.fileToUpload = files.item(0);

    this._appService.uploadFileForProject(this.fileToUpload, 2).subscribe((response: any) => {

      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.newProjectCreationSuccessfulMessage);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  removeImageAttachment(index) {
    this.imageFileList.splice(index, 1);
  }

  appendImageFiles(files: FileList) {

    if (this.imageFileList == null) {
      this.imageFileList = [];
    }

    for (let i = 0; i < files.length; i++) {
      this.imageFileList.push(files[i])
    }
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

      if (this.imageFileList == null) {
        this.imageFileList = [];
      }

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
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
    this.projectForm.get(['projIdentifiers', 'finalTags']).setValue(this.selectedTags);
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
      this.projectForm.get(['projIdentifiers', 'finalTags']).setValue(this.selectedTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.push(event.option.value);

    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.tagInput.nativeElement.blur();
    this.tagInput.nativeElement.focus();

    this.projectForm.get(['projIdentifiers', 'finalTags']).setValue(this.selectedTags);

  }


  validateTags(finalTags: FormControl) {
    if (finalTags.value && finalTags.value.length === 0) {
      return {
        validateTagsArray: { valid: false }
      };
    }
    return null;
  }

  tagInputFocusOut() {
    this.projectForm.get(['projIdentifiers', 'finalTags']).setValue(this.selectedTags);
  }

  //********************* Filter Section Ends *****************************/



  saveProject() {
    this.postProject(ProjectStatus.Unpublished);
  }

  publishProject() {
    this.postProject(ProjectStatus.Published);
  }

  selectedContractType: number;

  contractChanged(contractType) {
    this.selectedContractType = contractType;
  }


  postProject(projectStatus) {
    debugger;
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

    let projectDetails = {
      'bidEndDate': formValue.projDetails.bidEndDate.format("YYYY-MM-DD"),
      'city': '',
      'clientId': this.currentUser.clientId,
      'clientOrganisationId': this.currentUser.currentOrgId,
      'contractType': this.selectedContractType,
      'description': formValue.description,
      'duration': '',
      'estimatedBudget': formValue.projDetails.estimatedBudget,
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

    this._appService.createProject(projectDetails).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        let projectId = response.projectId;
        if (this.docFileList != null && this.docFileList.length > 0 && projectId != null) {
          this.postProjectAttachments(projectId);
        } else {
          this.showProjectSuccessDialog()
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  postProjectAttachments(projectId) {
    if (this.imageFileList != null && this.imageFileList.length > 0) {
      this.docFileList = this.docFileList.concat(this.imageFileList);
    }

    let successfileUpload = 0;

    this.docFileList.forEach(file => {
      this._appService.uploadFileForProject(file, projectId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == this.docFileList.length) {
            this.showProjectSuccessDialog()
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


  showProjectSuccessDialog() {
    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px', data: {
        type: DialogType.OneButtonDialog,
        title: "SUCCESS",
        message: AppLiterals.newProjectCreationSuccessfulMessage,
        yesButtonTitle: "OK"
      }
    });
    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        this.messageToEmit.emit(true);
      }
    });
  }



  ngOnInit(): void {
  }

  getProjectTags() {
    this._appService.getProjectTagList().subscribe((response) => {
      debugger;
      if (response.statusCode == APIResponse.Success) {
        this.allTags = response.tags;
        this.allTags.sort((a, b) => a.tagName.localeCompare(b.tagName));
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((data: Tag | null) => data ? this._filter(data) : this.allTags.slice()));
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}



@Component({
  selector: 'item-details-dialog',
  templateUrl: 'item-details-dialog.html',
})
export class itemDetailsDialog {

  addItems: FormGroup;
  constructor(
    private _formBuilder: FormBuilder,
  ) {
    this.addItems = this._formBuilder.group({
      itemDescription: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,5})?$')]],
      units: ['', [Validators.required]]
    });
  }
}


@Component({
  selector: 'project-preview-dialog',
  templateUrl: 'project-preview-dialog.html',
})

export class ProjectPreviewDialog {

  currentProject: any;
  docFileList: File[];

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ProjectPreviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.currentProject = this.data.projectData;
    console.log(this.currentProject)
    this.docFileList = this.data.docFileList;
  }
}

