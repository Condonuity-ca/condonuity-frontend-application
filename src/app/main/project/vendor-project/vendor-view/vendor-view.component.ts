import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { AppService } from '../../../services/app.service';
import { APIResponse, AppLiterals, AlertType, ProjectStatus, ContractType, UserType, SearchBarPageIndex, BidStatus } from '../../../../utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service';
import { VendorProject } from '../../../project/models/vendor-project.model';
import { QaService } from '../../service/qa.service';
import * as moment from 'moment';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { CondoBrowserService } from 'app/main/condo-browser/condo-browser.service';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'vendor-view',
  templateUrl: './vendor-view.component.html',
  styleUrls: ['./vendor-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class VendorViewComponent implements OnInit, OnDestroy {
  about: any;
  projectList = [];
  bidForm: FormGroup;
  totalEstimation: number = 0;
  editFlag: boolean = false;
  currentUser: any;
  currentProject: any;
  currentProjectStage = 1;

  projectDetails: VendorProject;
  ProjectDetailsWithBidInfo: any;

  isProjectReady = false;

  isProjectActive = true;

  private _unsubscribeAll: Subject<any>;
  @ViewChild('screentop', { static: false }) screenTop: ElementRef;

  constructor(
    private _qaService: QaService,
    private _formBuilder: FormBuilder,
    private _appUtil: AppUtilService,
    private _authService: AuthenticationService,
    private _appService: AppService,
    public dialog: MatDialog,
    public router: Router,
    private _projPostService: ProjectPostingService,
    private datePipe: DatePipe,
    private _menuService: MenuService,
    private _condoBrowserService: CondoBrowserService,
  ) {
    this._unsubscribeAll = new Subject();
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
    });

    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data != null) {
          this.currentProject = data.projectData;
          this.currentProjectStage = data.projectStage;

          if (this.currentProject.deleteStatus == 1) {
            this.isProjectActive = true;
          } else {
            this.isProjectActive = false;
          }

          if (this.currentUser.userType == UserType.Vendor) {
            this.getVendorProjectDetails()
          } else {
            this.getProjectDetailsForClient()
          }

        }
      }
    )

    this._projPostService.shouldRefreshProject.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        debugger;
        if (data != null && data == true) {
          this.getVendorProjectDetails()
          this._projPostService._shouldRefreshVendorProject.next(null);
        }
      }
    )
  }

  viewCondoProfile() {
    debugger;
    let data = { id: this.currentProject.clientOrganisationId, name: this.currentProject.condoName, sourceScreen: "CondoView" };
    this._condoBrowserService.setClientData(data);
    this.router.navigate(['/browseCondos/view']);
  }


  getVendorProjectDetails() {
    this._appService.getProjectDetailsForVendor(this.currentUser.vendorOrganisationId, this.currentProject.projectId
    ).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.ProjectDetailsWithBidInfo = response.project;

        if (this.currentProjectStage == 0 && this.ProjectDetailsWithBidInfo.vendorBid != null && this.ProjectDetailsWithBidInfo.vendorBid.bidStatus == 2) {
          this.currentProjectStage = 1;
        }
        let data = { project: response.project, projectStage: this.currentProjectStage };
        this._projPostService._projectWithBidData.next(data);
        this._qaService.projectQaSubject.next(data);
        this.populateProjectsInView(response.project);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  getProjectDetailsForClient() {

    this._appService.getProjectById(this.currentProject.projectId).subscribe(response => {
      if (response.statusCode == APIResponse.Success) {
        response.project.questionAnswers = response.questionAnswers;
        let data = { project: response.project, projectStage: this.currentProjectStage };
        this.populateProjectsInView(response.project)
        this._qaService.projectQaSubject.next(data);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      }
    },
      err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
      });
  }


  populateProjectsInView(project) {
    if (this.currentProjectStage == 0) {
      if (this.currentUser.userType == UserType.Client) {
        project.statusMessage = 'Published';
      } else {
        if (project.vendorBid != null && project.vendorBid.bidStatus == BidStatus.Pulled) {
          project.statusMessage = 'Bid Pulled';
        } else {
          project.statusMessage = 'Bid Not Submitted';
        }
      }
    } else if (this.currentProjectStage == 1) {
      project.statusMessage = 'Bid Submitted';
    } else {
      switch (project.status) {
        case ProjectStatus.Published: {
          project.statusMessage = 'Bid Submitted';
          break;
        }
        case ProjectStatus.Unpublished: {
          project.statusMessage = 'Un-published';
          break;
        }
        case ProjectStatus.Completed: {
          if (project.vendorBid != null) {
            switch (project.vendorBid.bidStatus) {
              case BidStatus.NotSubmitted: {
                project.statusMessage = 'Closed - Not Submitted';
                break;
              }
              case BidStatus.Submitted: {
                project.statusMessage = 'Closed - Submitted';
                break;
              }
              case BidStatus.Awarded: {
                if (project.vendorBid.id == project.awardedBidId) {
                  project.statusMessage = 'Won';
                } else {
                  project.statusMessage = 'Lost';
                }
                break;
              }
              case BidStatus.Pulled: {
                project.statusMessage = 'Closed - Pulled';
                break;
              }
            }
          } else {
            project.statusMessage = 'Closed - Not Submitted';
          }
          break;
        }
        case ProjectStatus.Cancelled: {
          project.statusMessage = 'Cancelled';
          break;
        }
      }
    }


    if (project.insuranceRequired == 1) {
      project.insuranceMessage = 'Yes';
    } else {
      project.insuranceMessage = 'No';
    }

    switch (project.contractType) {
      case ContractType.FixedCost: {
        project.contractMessage = 'Fixed Cost';
        break;
      }
      case ContractType.TimeAndMaterial: {
        project.contractMessage = 'Time & Material';
        break;
      }
      case ContractType.AnnualContract: {
        project.contractMessage = 'Annual Contract';
        break;
      }
    }

    let createdDate = moment(project.createdAt);
    if (createdDate.isValid()) {
      project.createdAt = moment(createdDate).format('MM/DD/YYYY');
    } else {
      project.createdAt = 'NA';
    }

    let startDate = moment(project.projectStartDate);
    if (createdDate.isValid()) {
      project.projectStartDate = moment(startDate).format('MM/DD/YYYY');
    } else {
      project.projectStartDate = 'NA';
    }

    let endDate = moment(project.bidEndDate);
    if (endDate.isValid()) {
      project.bidEndDate = moment(endDate).format('MM/DD/YYYY');
    } else {
      project.bidEndDate = 'NA';
    }

    let projCompletionDate = moment(project.projectCompletionDeadline);
    if (endDate.isValid()) {
      project.projectCompletionDeadline = moment(projCompletionDate).format('MM/DD/YYYY');
    } else {
      project.projectCompletionDeadline = 'NA';
    }

    var tagValueArray = [];
    if (project.tags != null && project.tags.length > 0) {
      for (var tag of project.tags) {
        tagValueArray.push(tag.tagName + ' ');
      }
    }


    project.tagListString = tagValueArray.toString();
    this.projectDetails = project;
    this.isProjectReady = true;
  }

  imageClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }


  addItem() {
    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    itemDetails.push(this._formBuilder.group({
      itemDescription: [''],
      quantity: [0, [Validators.pattern("^[0-9]*$")]],
      unit: [''],
      price: [0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
    }));
  }

  addLabourSummary() {
    let itemDetails = <FormArray>this.bidForm.controls.labourSummary as FormArray;
    itemDetails.push(this._formBuilder.group({
      itemDescription: [''],
      quantity: [0, [Validators.pattern("^[0-9]*$")]],
      unit: [''],
      price: [0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]

    }));
  }

  selectDate($event) {
    if ($event.checked == true) {
      this.bidForm.get('startDate').enable();
      this.bidForm.get('endDate').enable();


    } else if ($event.checked == false) {
      this.bidForm.get('startDate').disable();
      this.bidForm.get('endDate').disable();
    }
  }

  selectDuration($event) {
    if ($event.checked == true) {
      this.bidForm.get('time').enable();
      this.bidForm.get('unit').enable();


    } else if ($event.checked == false) {
      this.bidForm.get('time').disable();
      this.bidForm.get('unit').disable();
    }
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
  }

  openAskQuestionDialog() {
    // this.dialog.open(AskQuestionDialog,{width:'40%'});
  }
  submitBid() {
    this._projPostService.setBidEvent('submitBid');
    let data = { userType: 2, projectStatus: 2 }

    this._projPostService.setProjectData(data);
  }

  setType(data) {
    console.log(data.projectStatus)
  }

  ngOnInit(): void {
    this.screenTop.nativeElement.scrollIntoView();
  }

  ngOnDestroy(): void {
    this._projPostService._projectWithBidData.next(null);
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  //***************  Support User ********************/

  updateProjectStatus(status) {
    let confirmationMessage = '';
    if (status == 1) {
      confirmationMessage = AppLiterals.UnHideProjectConfirmation;
    } else {
      confirmationMessage = AppLiterals.HideProjectConfirmation;
    }

    const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px', data: {
        type: DialogType.TwoButtonDialog,
        title: "PLEASE CONFIRM",
        message: confirmationMessage,
        yesButtonTitle: "YES",
        noButtonTitle: "NO"
      }
    });
    userNewRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (result == 'true') {
          this.confirmProjectStatus(status);
        } else {
          console.log("No tapped");
        }
      }
    });
  }

  confirmProjectStatus(status) {
    var projectStatus = {
      'projectId': this.currentProject.projectId,
      'activeStatus': status,
      'supportUserId': this.currentUser.id
    }

    this._appService.hideProject(projectStatus).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this._appUtil.showAlert(AlertType.Success, AppLiterals.HideProjectSuccessful);
        debugger;
        if (status == 1) {
          this.isProjectActive = true;
        } else {
          this.isProjectActive = false;
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.HideProjectFailure);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });

  }
}



