import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input, Output, EventEmitter } from '@angular/core';
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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Bids } from '../../models/bids.model';
import { AppUtilService } from 'app/utils/app-util.service';

@Component({
  selector: 'bid-details',
  templateUrl: './bid-details.component.html',
  styleUrls: ['./bid-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BidDetailsComponent implements OnInit, OnDestroy {

  @Input() bidData;
  @Input() isProjectAwarded;
  @Output() messageToEmit = new EventEmitter<boolean>();


  private _unsubscribeAll: Subject<any>;

  bidItems = [];
  bidLaborItmes = [];

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _appUtil: AppUtilService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  getDetails() {
    this.bidData.biddingProducts.forEach(item => {
      item.totalPrice = Number(item.quantity) * Number(item.price);
      if (item.productType == "1") {
        this.bidItems.push(item);
      } else {
        this.bidLaborItmes.push(item);
      }
    });
  }


  attachmentClicked(fileDetails) {
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }

  selectVendor() {
    this.messageToEmit.emit(this.bidData);
  }


  /**
   * On init
   */
  ngOnInit(): void {
    debugger;
    this.getDetails();
    this.bidData.bidFiles.forEach(file => {
      file.fileSize = AppUtilService.formatSizeUnits(file.fileSize);
      return file;
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



