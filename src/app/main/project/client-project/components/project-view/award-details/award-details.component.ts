import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';

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
import * as moment from 'moment';
import { ProjectPostingService } from '../project-posting/services/project-posting.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { AppService } from 'app/main/services/app.service';
import { APIResponse, AlertType, AppLiterals, AppDateFormat, MaxFileSize } from 'app/utils/app-constants';
import { ProjectAward } from '../model/project-award.model';
import { AuthenticationService } from 'app/_services';

export interface DialogData {
  bidData: any;
  currentUser: any;
  bidList: any;
}

@Component({
  selector: 'award-details',
  templateUrl: './award-details.component.html',
  styleUrls: ['./award-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AwardDetailsComponent implements OnInit, OnDestroy {

  @Input() selectedBid;

  currentSelectedBid: any;
  about: any;
  projectInfo;
  vendorBidList: [];
  awardDecision: any;

  awardingDetails: ProjectAward;
  bidAwardingDetails: any;
  currentUser: any;


  private _unsubscribeAll: Subject<any>;

  constructor(
    private _appUtil: AppUtilService,
    private _projPostService: ProjectPostingService,
    public dialog: MatDialog,
    private _authService: AuthenticationService
  ) {
    this._unsubscribeAll = new Subject();

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
    });
  }


  editAwardee() {
    const userAccountRef = this.dialog.open(EditAwardeeDialog, { data: { bidData: this.currentSelectedBid, bidList: this.vendorBidList, currentUser: this.currentUser } });
    userAccountRef.afterClosed().subscribe(result => {
      if (result) {
        this.awardingDetails = result;
      }
    });
  }

  attachmentClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }

  /**
   * On init
   */
  ngOnInit(): void {
    var awardedBid: any;
    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data.awardedBid != null && !(this.isEmptyObject(data.awardedBid))) {
          this.awardingDetails = new ProjectAward(data.awardedBid.awardInformation);
          this.awardingDetails.vendorOrganisationName = data.awardedBid.bid.organisationName;
          this.awardingDetails.attachments = data.awardedBid.awardFiles;

          this.awardingDetails.attachments.forEach(file => {
            file.fileSize = AppUtilService.formatSizeUnits(file.fileSize);
            return file;
          })
          awardedBid = data.awardedBid;
          this.currentSelectedBid = awardedBid;
        }

        if (data.allBids) {
          data.allBids.forEach(bidInfo => {
            bidInfo.submitDate = moment(bidInfo.modifiedDate).format('MM/DD/YYYY');
            bidInfo.vendorDisplayRating = (Math.round(bidInfo.rating * 10) / 10).toFixed(1);
            bidInfo.projectStartDate = moment(bidInfo.vendorStartDate).format('MM/DD/YYYY');
            bidInfo.totalPrice = bidInfo.bidPrice + ' CAD';
            return bidInfo;
          });
        }
        this.vendorBidList = data.allBids;
      })

    if (awardedBid != null) {
      this.currentSelectedBid = awardedBid;
    } else if (this.selectedBid != null) {
      this.currentSelectedBid = this.selectedBid;
      this.editAwardee();
    }
  }


  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
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
  selector: 'edit-awardee-dialog',
  templateUrl: 'edit-awardee-dialog.html',
})
export class EditAwardeeDialog {

  bidData: any;
  vendorBidList: any;
  docFileList: any[] = [];
  filesToUpload: any[] = [];
  filesToDelete: any[] = [];

  awardEditForm: FormGroup;
  imageFileData = [];
  docsFileData = [];

  isEditAward = false;

  private _unsubscribeAll: Subject<any>;
  currentUser: any;

  constructor(
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _projPostService: ProjectPostingService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditAwardeeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this._unsubscribeAll = new Subject();

    if (data != null) {
      this.bidData = null;
      this.bidData = data.bidData;
      this.vendorBidList = data.bidList;
      this.currentUser = data.currentUser;
    }

    if (this.bidData.awardFiles != null) {
      for (let document of this.bidData.awardFiles) {
        let file = {
          "name": document.fileName,
          "formatedSize": document.fileSize,
          "isExistingFile": true,
          "attachmentId": document.id
        }
        this.docFileList.push(file);
      }
    }

    if (this.bidData.awardInformation != null) {
      this.isEditAward = true;
      this.awardEditForm = this._formBuilder.group({
        vendorName: [{ value: this.bidData.bid.id, disabled: true }, Validators.required],
        totalPrice: [{ value: this.bidData.awardInformation.totalPrice, disabled: true }, Validators.required],
        startDate: [{ value: moment(this.bidData.awardInformation.startDate), disabled: true }, Validators.required],
        duration: [{ value: this.bidData.awardInformation.duration, disabled: true }, Validators.required],
        awardDate: [{ value: moment(this.bidData.awardInformation.awardDate), disabled: true }, Validators.required],
        comments: [this.bidData.awardInformation.comments]
      });
    } else {
      this.awardEditForm = this._formBuilder.group({
        vendorName: [this.bidData.id, Validators.required],
        totalPrice: [this.bidData.bidPrice, Validators.required],
        startDate: [moment(this.bidData.vendorStartDate), Validators.required],
        duration: [this.bidData.vendorProjectDuration, Validators.required],
        awardDate: [new Date(), Validators.required],
        comments: [this.bidData.comments]
      });
    }
  }


  bidSelectionChanged(bidId) {
    let selectedBid = this.vendorBidList.find(bid => bid.id == bidId);
    this.bidData = selectedBid;
    this.awardEditForm.get('totalPrice').setValue(this.bidData.bidPrice);
    this.awardEditForm.get('startDate').setValue(moment(this.bidData.vendorStartDate));
    this.awardEditForm.get('duration').setValue(this.bidData.vendorProjectDuration);
    this.awardEditForm.get('comments').setValue(this.bidData.comments);
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


  awardProject() {
    let formValue = this.awardEditForm.value;
    this.processAwardAttachments();

    var bidInfo: any;

    var totalPrice: string;
    var vendorStartDate: string;
    var duration: string;
    var awardDate: string;

    debugger;

    if (this.isEditAward == true) {
      bidInfo = this.bidData.bid;
      totalPrice = bidInfo.bidPrice;
      vendorStartDate = bidInfo.vendorStartDate;
      duration = bidInfo.vendorProjectDuration;
      awardDate = moment(this.bidData.awardInformation.awardDate).format(AppDateFormat.ServiceFormat)
    } else {
      bidInfo = this.bidData;
      totalPrice = formValue.totalPrice;
      vendorStartDate = moment(formValue.startDate).format(AppDateFormat.ServiceFormat);
      duration = formValue.duration;
      awardDate = moment(formValue.awardDate).format(AppDateFormat.ServiceFormat)
    }

    let projectAwardingDetails = {
      "awardDate": moment(formValue.awardDate).format(AppDateFormat.ServiceFormat),
      "awardedBidId": bidInfo.id,
      "comments": formValue.comments,
      "projectId": bidInfo.projectId,
      "startDate": vendorStartDate,
      "totalPrice": totalPrice,
      "vendorOrganisationId": bidInfo.vendorUser.vendorOrganisationId,
      "vendorOrganisationName": bidInfo.organisationName,
      "duration": duration,
      "modifiedByUserId": this.currentUser.clientId
    }

    let projectAward = new ProjectAward(projectAwardingDetails);
    projectAward.attachments = this.docFileList;

    this._appService.awardProjectBid(projectAwardingDetails).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        let awardId = response.projectAwardId;
        // projectAwardingDetails.awardDate = moment(formValue.awardDate).format(AppDateFormat.DisplayFormat);
        // projectAwardingDetails.startDate = bidInfo.vendorStartDate;
        // formValue.startDate.format(AppDateFormat.DisplayFormat);

        if (this.filesToDelete != null && this.filesToDelete.length > 0 && awardId != null) {
          this.deleteAwardAttachments();
        }

        if (this.filesToUpload != null && this.filesToUpload.length > 0 && awardId != null) {
          this.postAwardingAttachments(awardId, projectAward, bidInfo.projectId);
        } else {
          this.refreshProject(bidInfo.projectId);
          // this.dialogRef.close(projectAward);
          // this._appUtil.showAlert(AlertType.Success, AppLiterals.projectAwardSuccess);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  refreshProject(selectedProjectId) {
    this._appService.getProjectById(selectedProjectId).subscribe(res => {
      debugger;
      res.openProjectInEditMode = true;
      this._projPostService.setProjectData(res);
      this._appUtil.showAlert(AlertType.Success, AppLiterals.projectAwardSuccess);
      this.dialogRef.close("");
    },
      err => {
        console.log(err);
      });
  }


  processAwardAttachments() {
    this.filesToUpload = this.docFileList.filter(document => document.isExistingFile == false);
    if (this.bidData.awardFiles != null) {
      this.bidData.awardFiles.forEach(file => {
        let filteredFile = this.docFileList.find(document => document.attachmentId == file.id);
        if (filteredFile == null) {
          this.filesToDelete.push(file);
        }
      });
    }
  }

  deleteAwardAttachments() {
    var fileIdArray = this.filesToDelete.map(function (file) {
      return file.id;
    });
    this._appService.deleteProjectAwardFiles(fileIdArray).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        console.log("deleted");
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }



  postAwardingAttachments(bidAwardId, awardingDetails, projectId) {
    let successfileUpload = 0;
    this.filesToUpload.forEach(file => {
      this._appService.uploadFileForBidAwarding(file, bidAwardId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == this.filesToUpload.length) {
            this.refreshProject(projectId);
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

  editOtherCorp() {
    console.log(this.awardEditForm.value);
  }
}