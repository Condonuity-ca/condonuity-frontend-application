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
  editData;

  currentProjectStage = 0;


  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    // private _profileService: ProfileService
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService,
    private datePipe: DatePipe
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();

    this.editData = {
      availableStartDate: true, availableStartDuration: false, time: '10', unit: 'months', startDate: '10/12/2019', endDate: '1/1/2021',
      itemsSummary: [{ itemDescription: 'Paint', quantity: 50, unit: 'lts', price: 20 }, { itemDescription: 'Water', quantity: 100, unit: 'lts', price: 2 }],
      labourSummary: [{ itemDescription: 'Labour', quantity: 50, unit: 'Day', price: 500 }, { itemDescription: 'Labour Materials', quantity: 50, unit: 'Day', price: 10 }], otherInfoStartDate: '10/10/2012',
      otherInfoDuration: 20, inScope: 'Paint,Fixed', outOfScope: 'Published', prerequisite: 'googleit', chooseReason: 'none'
    }


    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.currentProjectStage = data.projectStage;

        if (data.projectStatus == 2) {
          this.editFlag = true;

          console.log(this.editData.startDate, this.editData.time)
          this.bidForm = this._formBuilder.group(
            {
              availableStartDate: [this.editData.availableStartDate],
              availableStartDuration: [this.editData.availableStartDuration],
              startDate: [{ value: this.datePipe.transform(this.editData.startDate, 'yyyy-MM-ddThh:mm:ssZ'), disabled: !this.editData.availableStartDate }],
              time: [{ value: this.editData.time, disabled: !this.editData.availableStartDuration }],
              unit: [{ value: this.editData.unit, disabled: !this.editData.availableStartDuration }],
              endDate: [{ value: this.datePipe.transform(this.editData.endDate, 'yyyy-MM-ddThh:mm:ssZ'), disabled: !this.editData.availableStartDate }],
              itemsSummary: this._formBuilder.array([]),
              labourSummary: this._formBuilder.array([]),
              otherInfoStartDate: [this.datePipe.transform(this.editData.otherInfoStartDate, 'yyyy-MM-ddThh:mm:ssZ')],
              otherInfoDuration: [this.editData.otherInfoDuration],
              inScope: [this.editData.inScope],
              outOfScope: [this.editData.outOfScope],
              prerequisite: [this.editData.prerequisite],
              chooseReason: [this.editData.chooseReason]
            }
          );
          this.editData.itemsSummary.forEach(element => {
            this.addItem();
          });
          this.editData.labourSummary.forEach(element => {
            this.addLabourSummary();
          });
          this.bidForm.patchValue({
            itemsSummary: this.editData.itemsSummary,
            labourSummary: this.editData.labourSummary,
          })

          this.calculateEstimation();
        }
        else {
          this.editFlag = false;
          this.bidForm = this._formBuilder.group({
            availableStartDate: [false],
            availableStartDuration: [false],
            startDate: [{ value: '', disabled: true }],
            time: [{ value: '', disabled: true }],
            unit: [{ value: '', disabled: true }],
            endDate: [{ value: '', disabled: true }],
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
      }
    )

  }


  addItem() {
    let itemDetails = <FormArray>this.bidForm.controls.itemsSummary as FormArray;
    itemDetails.push(this._formBuilder.group({
      itemDescription: [''],
      quantity: [0, [Validators.pattern("^[0-9]*$")]],
      unit: [''],
      price: [0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]
      // ("^[0-9]*$")
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
    this.dialog.open(AskQuestionDialog, { width: '40%' });
  }

  submitBid() {
    this._projPostService.setBidEvent('submitBid');
    let data = { userType: 2, projectStatus: 2 }
    this._projPostService.setProjectData(data);
  }

  setType(data) {
    console.log(data.projectStatus)

  }


  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {


  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
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

