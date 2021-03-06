import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat, MaxFileSize } from 'app/utils/app-constants';
import { AuthenticationService } from 'app/_services';
import * as moment from 'moment';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';
import { delay } from 'lodash';

@Component({
  selector: 'bid-creation',
  templateUrl: './bid-creation.component.html',
  styleUrls: ['./bid-creation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class BidCreationComponent implements OnInit, OnDestroy {
  about: any;
  projectList = [];
  bidForm: FormGroup;
  totalEstimation: number = 0;
  editFlag: boolean = false;
  public show: boolean = true;
  public buttonName: any = 'Start Your Bid';

  // docFileList: File[];
  selectedProject: any;
  currentUser: any;
  createdBidId: any;

  bidInfo: any;
  bidAttachments: any[];

  currentProjectStage = 0;
  bidStartDateMin = new Date();

  isValidBid = false;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _authService: AuthenticationService,
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService,
    private datePipe: DatePipe,
  ) {

    debugger;
    // Set the private defaults
    this._unsubscribeAll = new Subject();

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
    });

    this._projPostService.projectWithBidData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        debugger;

        if (data == null) {
          return;
        }
        this.selectedProject = data.project;
        this.currentProjectStage = data.projectStage;

        this.editFlag = true;
        this.bidInfo = this.selectedProject.vendorBid;



        if (this.bidInfo != null) {

          var vendorStartDate: any;
          if (this.bidInfo.vendorStartDate != null) {
            vendorStartDate = moment(this.bidInfo.vendorStartDate);
          }

          this.bidForm = this._formBuilder.group({
            startDate: vendorStartDate,
            time: this.bidInfo.vendorProjectDuration,
            unit: [],
            // endDate: moment(this.bidInfo.vendorEndDate),
            itemsSummary: this._formBuilder.array([]),
            labourSummary: this._formBuilder.array([]),
            inScope: [this.bidInfo.inScope],
            outOfScope: [this.bidInfo.outOfScope],
            prerequisite: [this.bidInfo.preRequisite],
            chooseReason: [this.bidInfo.reasonForChoose]
          });

          this.bidInfo.biddingProducts.forEach(product => {
            if (product.productType == '1') {
              this.addItem(product);
            } else {
              this.addLabourSummary(product);
            }
          });

          this.bidAttachments = [];

          if (this.bidInfo.bidFiles != null) {
            this.bidInfo.bidFiles.forEach(file => {
              this.bidAttachments.push({
                "name": file.fileName,
                "formatedSize": AppUtilService.formatSizeUnits(file.fileSize),
                "fileType": "2",
                "file": file,
                "blob": file.blobName
              });
            })
          }
          this.calculateEstimation();
        }
      }
    )
  }

  removeDocAttachment(index) {
    this.bidAttachments.splice(index, 1);
  }



  appendDocumentFiles(event) {
    let files = event.target.files;
    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
      if (this.bidAttachments == null) {
        this.bidAttachments = [];
      }
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
        this.bidAttachments.push({
          "name": file.name,
          "formatedSize": file.formatedSize,
          "fileType": "1",
          "file": file
        });
      }
    } else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }


  addItem(itemInfo) {
    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;

    if (itemInfo != null) {
      itemDetails.push(this._formBuilder.group({
        itemDescription: [itemInfo.description],
        quantity: [itemInfo.quantity, [Validators.pattern("^[0-9]*$")]],
        unit: [itemInfo.unit],
        price: [itemInfo.price, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
      }));
    } else {
      itemDetails.push(this._formBuilder.group({
        itemDescription: [''],
        quantity: [0, [Validators.pattern("^[0-9]*$")]],
        unit: [''],
        price: [0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
      }));
    }
    this.validateProjectBid();
  }

  addLabourSummary(laborInfo) {
    let itemDetails = <FormArray>this.bidForm.controls.labourSummary as FormArray;

    if (laborInfo != null) {
      itemDetails.push(this._formBuilder.group({
        itemDescription: [laborInfo.description],
        quantity: [laborInfo.quantity, [Validators.pattern("^[0-9]*$")]],
        unit: [laborInfo.unit],
        price: [laborInfo.price, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
      }));
    } else {
      itemDetails.push(this._formBuilder.group({
        itemDescription: [''],
        quantity: [0, [Validators.pattern("^[0-9]*$")]],
        unit: [''],
        price: [0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
      }));
    }
    this.validateProjectBid();
  }

  calculateEstimation() {
    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    let labourDetails = <FormArray>this.bidForm.controls.labourSummary as FormArray;
    this.totalEstimation = 0;
    let itemTotal = 0;
    let labourTotal = 0;

    itemDetails.value.forEach(element => {
      let calculated = Number(element.price) * Number(element.quantity);
      itemTotal += calculated
    });

    labourDetails.value.forEach(element => {
      let calculated = Number(element.price) * Number(element.quantity);
      labourTotal += calculated;
    });

    this.totalEstimation = itemTotal + labourTotal;

    this.validateProjectBid();
  }

  openAskQuestionDialog() {
    this.dialog.open(AskQuestionDialog, { width: '500px' });
  }


  submitBid(actionType) {

    var projectProducts = [];
    let bidStatus = actionType;

    let formValue = this.bidForm.value;

    let projectStartDate = '';
    if (formValue.startDate != null && formValue.startDate != '') {
      projectStartDate = formValue.startDate.format("YYYY-MM-DD");
    }
    let projectDuration = formValue.time;

    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    let labourDetails = <FormArray>this.bidForm.controls.labourSummary as FormArray;
    itemDetails.value.forEach(element => {
      projectProducts.push({
        "description": element.itemDescription,
        "price": element.price,
        "productType": 1,
        "quantity": element.quantity,
        "unit": element.unit
      });
    });

    labourDetails.value.forEach(element => {
      projectProducts.push({
        "description": element.itemDescription,
        "price": element.price,
        "productType": 2,
        "quantity": element.quantity,
        "unit": element.unit
      });
    });

    let bidDetails = {
      "bidPrice": this.totalEstimation,
      "projectId": this.selectedProject.projectId,
      "vendorOrgId": this.currentUser.vendorOrganisationId,
      "vendorUser": {
        "userId": this.currentUser.userId
      },
      "vendorStartDate": projectStartDate,
      "vendorProjectDuration": projectDuration,
      "inScope": formValue.inScope,
      "outOfScope": formValue.outOfScope,
      "preRequisite": formValue.prerequisite,
      "reasonForChoose": formValue.chooseReason,
      "bidStatus": bidStatus,
      "isInsuranceAvailable": 2,
      "insuranceId": 0,
      "biddingProducts": projectProducts
    }

    if ((this.bidInfo != null && this.bidInfo.id != null) || this.createdBidId != null) {

      if (this.bidInfo != null) {
        bidDetails['id'] = this.bidInfo.id;
      } else {
        bidDetails['id'] = this.createdBidId;
      }

      this._appService.updateProjectBid(bidDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          var fileToUpload: any;
          if (this.bidAttachments != null && this.bidAttachments.length > 0) {
            fileToUpload = this.bidAttachments.filter(attachment => attachment.fileType == 1)
          }
          if (fileToUpload != null && fileToUpload.length > 0) {
            this.postBidAttachments(this.bidInfo.id, bidStatus);
          } else {
            if (bidStatus == "1") {
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidSavedSuccessfully);
            } else {
              this.currentProjectStage = 1;
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidPostedSuccessfully);
            }
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });

    } else {
      this._appService.createNewProjectBid(bidDetails).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          let bidId = response.bidId;
          this.createdBidId = response.bidId;
          if (this.bidAttachments != null && this.bidAttachments.length > 0 && bidId != null) {
            this.postBidAttachments(bidId, bidStatus);
          } else {
            if (bidStatus == "1") {
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidSavedSuccessfully);
              // this._projPostService._shouldRefreshVendorProject.next(true);
            } else {
              this.bidInfo = bidDetails;
              this.bidInfo.id = bidId;
              this.currentProjectStage = 1;
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidPostedSuccessfully);
            }
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
    }
  }

  removeLabour(labourIndex: number) {
    let listItems = <FormArray>this.bidForm.controls.labourSummary as FormArray;
    listItems.removeAt(labourIndex);
    this.validateProjectBid();
  }

  removeItem(itemIndex: number) {
    let listItems = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    listItems.removeAt(itemIndex);
    this.validateProjectBid();
  }


  validateProjectBid() {
    var isBidValid = false;
    let formValue = this.bidForm.value;
    let projectStartDate = formValue.startDate.format("YYYY-MM-DD");
    let projectDuration = formValue.time;
    let inScope = formValue.inScope;

    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    let labourDetails = <FormArray>this.bidForm.controls.labourSummary as FormArray;

    if (projectStartDate != null && projectStartDate != '' &&
      projectDuration != null && projectDuration != '' && inScope.trim() != '' &&
      (itemDetails.length > 0 || labourDetails.length > 0)) {

      itemDetails.value.forEach(element => {
        if (element.itemDescription.trim() != "" && element.price.trim() != "" && element.quantity.trim() != "" && element.unit.trim() != "") {
          isBidValid = true;
        }
      });

      if (!isBidValid) {
        // isBidValid = false;
        labourDetails.value.forEach(element => {
          if (element.itemDescription.trim() != "" && element.price.trim() != "" && element.quantity.trim() != "" && element.unit.trim() != "") {
            isBidValid = true;
          }
        });
      }
    }
    this.isValidBid = isBidValid;
  }


  postBidAttachments(bidId, bidStatus) {
    let successfileUpload = 0;
    var filesToUpload = this.bidAttachments.filter(attachment => attachment.fileType == 1)
    filesToUpload.forEach(attachment => {
      this._appService.uploadFileForBid(attachment.file, bidId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == filesToUpload.length) {
            if (bidStatus == "1") {
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidSavedSuccessfully);

              this.bidAttachments.map(attachment => {
                attachment.fileType = "2";
                return attachment;
              })


              // this._projPostService._shouldRefreshVendorProject.next(true);
            } else {
              this.currentProjectStage = 1;
              this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidPostedSuccessfully);
            }
          }
        } else if (response.statusCode == '8') { //Exeed the maximum file size

        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        console.log(err);
      });
    });
  }

  submitProjectBid(projectBidId) {
    this._appService.postProjectBid(projectBidId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.projectBidPostedSuccessfully);
        this.currentProjectStage = 1;
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }

  setType(data) {
    console.log(data.projectStatus)
  }

  revokeBid() {
    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px', data: {
        type: DialogType.TwoButtonDialog,
        title: "Please Confirm",
        message: "Are you sure, you want to withdraw the submitted bid?",
        yesButtonTitle: "Yes",
        noButtonTitle: "No"
      }
    });

    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (result == 'true') {
          if (this.createdBidId != null) {
            this.confirmPullBid(this.createdBidId);
          } else {
            this.confirmPullBid(this.bidInfo.id);
          }
        }
      }
    });
  }


  confirmPullBid(bidId) {
    this._appService.pullProjectBid(bidId).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.bidPulledSuccessfully);
        this.currentProjectStage = 0;
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unabletoRevokeBid);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      console.log(err);
    });
  }


  /**
   * On init
   */
  ngOnInit(): void {

    this.editFlag = false;
    this.bidForm = this._formBuilder.group({
      startDate: [''],
      time: [''],
      unit: [{ value: '', disabled: true }],
      // endDate: [{ value: '', disabled: true }],
      itemsSummary: this._formBuilder.array([]),
      labourSummary: this._formBuilder.array([]),
      otherInfoStartDate: [''],
      otherInfoDuration: [''],
      inScope: [''],
      outOfScope: [''],
      prerequisite: [''],
      chooseReason: ['']
    });
  }

  @ViewChild('target', { static: false }) target: ElementRef;
  toggle() {
    document.getElementById('info-banner').scrollTo({ behavior: "smooth" });
  }

  scroll() {
    // this.target.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.target.nativeElement.scrollIntoView();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
  constructor(
    private _formBuilder: FormBuilder,
  ) {
    this.questionCreationForm = this._formBuilder.group({
      question: ['', Validators.required]

    });
  }


}

