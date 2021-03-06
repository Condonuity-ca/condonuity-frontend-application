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
  selector: 'bid-information',
  templateUrl: './bid-information.component.html',
  styleUrls: ['./bid-information.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BidInformationComponent implements OnInit, OnDestroy {
  about: any;
  bidData;
  totalEst: number = 0;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _projPostService: ProjectPostingService
  ) {
    debugger;
    this._unsubscribeAll = new Subject();
    this._projPostService.getProjectData.subscribe(
      data => console.log(data)
    )

  }

  viewProjects(event) {
    let allowEventType = 'click';
    if (event.type == allowEventType) {
      console.log(event.row.projectId);
      let route = 'projects/vendor/viewProjects';
      this.router.navigate([route]);
    }
  }

  calculateTotal() {
    let estTotal = 0;
    this.bidData.itemSummary.forEach(element => {
      estTotal += element.quantity * element.price
    });

    this.bidData.labourSummary.forEach(element => {
      estTotal += element.quantity * element.price
    });
    console.log(estTotal)
    this.totalEst = estTotal;
  }

  /**
   * On init
   */
  ngOnInit(): void {
    debugger;
    this.bidData = { availableStartDate: '10/10/2019', endDate: '10/1/2020', itemSummary: [{ itemDesc: 'Paint', quantity: 50, unit: 'lts', price: 20 }, { itemDesc: 'Water', quantity: 100, unit: 'lts', price: 2 }], labourSummary: [{ itemDesc: 'Labour', quantity: 50, unit: 'Day', price: 500 }, { itemDesc: 'Labour Materials', quantity: 50, unit: 'Day', price: 10 }], estStartDate: '10/10/2012', estEndDate: '12/12/2013', inScope: 'Paint,Fixed', outOfScope: 'Published', prerequisite: 'googleit', whyChooseMe: 'none' };
    this.calculateTotal();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

