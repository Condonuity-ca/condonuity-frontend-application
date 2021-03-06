import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Subject, Observable, of, Subscription } from 'rxjs';
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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Bids } from '../../models/bids.model';
import { MatSort, Sort } from '@angular/material';
import { MatPaginator, PageEvent } from '@angular/material';
import { fromMatSort, sortRows } from '../datasource-utils';
import { fromMatPaginator, paginateRows } from '../datasource-utils';
import { ProjectPostingService } from '../project-posting/services/project-posting.service';
import * as moment from 'moment';

@Component({
  selector: 'bid-list',
  templateUrl: './bid-list.component.html',
  styleUrls: ['./bid-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class BidListComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @Output() messageToEmit = new EventEmitter<boolean>();

  displayedRows$: Observable<Bids[]>;
  totalRows$: Observable<number>;
  no_bidlist = 'No bids yet';
  isBidListEmpty = false;
  private _unsubscribeAll: Subject<any>;
  isProjectDetailsLoaded: boolean = false;

  isProjectAwarded = false;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _projPostService: ProjectPostingService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this._projPostService.getProjectData.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data.project.awardedBidId != null && data.project.awardedBidId != '' && data.project.awardedBidId > 0) {
          this.isProjectAwarded = true;
        }
        if (data.allBids) {
          data.allBids.forEach(bidInfo => {
            bidInfo.submitDate = moment(bidInfo.modifiedDate).format('MM/DD/YYYY');
            bidInfo.vendorDisplayRating = (Math.round(bidInfo.rating * 10) / 10).toFixed(1);
            bidInfo.projectStartDate = moment(bidInfo.vendorStartDate).format('MM/DD/YYYY');
            bidInfo.totalPrice = bidInfo.bidPrice;
            if (bidInfo.vendorOrgName == null) {
              bidInfo.vendorOrgName = "Vendor Org";
            }
            return bidInfo;
          });

          this.isProjectDetailsLoaded = true;
          const sortEvents$: Observable<Sort> = fromMatSort(this.sort);
          const rows$ = of(data.allBids);

          this.totalRows$ = rows$.pipe(map(rows => rows.length));
          this.displayedRows$ = rows$.pipe(sortRows(sortEvents$));
          if (data.allBids.length == 0) {
            this.isBidListEmpty = true;
          }
        }
      }
    )
  }

  selectedBid(bidInfo) {
    this.messageToEmit.emit(bidInfo);
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


