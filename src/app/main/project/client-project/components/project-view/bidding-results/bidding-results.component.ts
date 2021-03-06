import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
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
@Component({
    selector: 'bidding-results',
    templateUrl: './bidding-results.component.html',
    styleUrls: ['./bidding-results.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class BiddingResultsComponent implements OnInit, OnDestroy {
    projectInfo;

    @Output() messageToEmit = new EventEmitter<boolean>();


    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        public dialog: MatDialog,
    ) {
        this._unsubscribeAll = new Subject();
    }

    selectedBid(bidInfo) {
        this.messageToEmit.emit(bidInfo);
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

